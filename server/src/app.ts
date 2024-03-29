import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as ConnectSessionSequelize from 'connect-session-sequelize'
import * as cors from 'cors'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express'
import * as jwt from 'express-jwt'
import * as session from 'express-session'
import * as jwks from 'jwks-rsa'
import * as path from 'path'
import { sequelize } from './db/models'
import { Error404 } from './errors'
import * as routes from './routes'
import jsonErrorHandler from './utils/jsonErrors'

const SequelizeStore = ConnectSessionSequelize(session.Store)

// Set up the jwt middleware
const authCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://kevinpena.auth0.com/.well-known/jwks.json',
  }),
  // This is the identifier we set when we created the API
  audience: 'https://soft.agualaif.com',
  issuer: 'https://kevinpena.auth0.com/',
  algorithms: ['RS256'],
})

// Set up the session store and middleware
const sessionStore = new SequelizeStore({
  db: sequelize,
  table: 'Session',
})

const sessionMiddleware = session({
  secret: ';b2x{EZ[#hQC@-Ny',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
})

const app = express()
// app.use('*', (req:any, res: any, next: any) => {console.log(req); next()})

// Common middleware
app.use(compression()) // Use gzip to compress all requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(sessionMiddleware)

// Serve static assets
const STATIC_FOLDER = path.resolve(__dirname, '../../client/dist')
const INDEX_FILE = path.resolve(__dirname, '../../client/dist/index.html')
app.use(express.static(STATIC_FOLDER))

// API routes
if (process.env.NODE_ENV === 'production')
  app.use('/api', authCheck)

app.use('/api/users', routes.users)
app.use('/api/clients', routes.clients)
app.use('/api/products', routes.products)
app.use('/api/prices', routes.prices)
app.use('/api/sells', routes.sells)
app.use('/api/payments', routes.payments)
app.use('/api/spendings', routes.spendings)
app.use('/api/inventory', routes.inventory)
app.use('/api/machine-counters', routes.machineCounters)
app.use('/api/balance', routes.balance)
app.use('/api/analysis', routes.analysis)

app.use('/api', (req, _res, next) => {
  next(new Error404(`Route does not exist: ${req.method} ${req.path}`))
})

// Error handler for any error thrown
// in any route or middleware
app.use(jsonErrorHandler)

// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
declare module 'express-session' {
  interface Session {
    userId?: number
  }
}

// Check the routes that require logged user
function checkUser(req: Request, res: Response, next: NextFunction) {
  if (typeof req.session.userId === 'number')
    next()
  else
    res.redirect('/check')

}

app.get('/sell', checkUser)

// Serve the SPA for any unhandled route (it handles 404)
app.get('*', (_req, res) => {
  res.sendFile(INDEX_FILE)
})

export default app
