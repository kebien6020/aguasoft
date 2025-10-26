import ConnectSessionSequelize from 'connect-session-sequelize'
import express from 'ultimate-express'
import type { NextFunction, Request, Response } from 'ultimate-express'
import { GetVerificationKey, expressjwt as jwt, UnauthorizedError } from 'express-jwt'
import session from 'express-session'
import { expressJwtSecret } from 'jwks-rsa'
import { resolve } from 'node:path'
import { sequelize } from './db/sequelize.js'
import { Error404 } from './errors.js'
import * as routes from './routes/index.js'
import jsonErrorHandler from './utils/jsonErrors.js'

const SequelizeStore = ConnectSessionSequelize(session.Store)

const googleClientID = '327533471227-niedralk7louhbv330rm2lk1r8mgcv9g.apps.googleusercontent.com'
const googleIssuer = 'https://accounts.google.com'
const googleJwks = 'https://www.googleapis.com/oauth2/v3/certs'

// Set up the jwt middleware
const authCheck = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 60,
    jwksUri: googleJwks,
  }) as unknown as GetVerificationKey, // Force type which is like this because of backward compatibility
  audience: googleClientID,
  issuer: googleIssuer,
  algorithms: ['RS256'],
})

declare module 'ultimate-express' {
  interface Request {
    auth?: AuthData
  }
}

// Validate email in the jwt
type AuthData = {
  iss: string // should match googleIssuer
  aud: string // client id
  sub: string
  email: string
  email_verified: boolean
  name: string
  picture: string // url
  given_name: string
  family_name: string
  iat: number // unix timestamp
  nbf: number // unix timestamp
  exp: number // unix timestamp
  jti: string // jwt id
}
const acceptedEmails = [
  'kevin.pena.prog@gmail.com',
  'agualaif@gmail.com',
  'jairopsanchez@gmail.com',
]
function validateJwtEmail(req: Request, _res: Response, next: NextFunction) {
  if (req.auth) {
    if (acceptedEmails.includes(req.auth.email) && req.auth.email_verified) {
      next()
      return
    } else {
      next(new UnauthorizedError('credentials_required', { message: 'Email not allowed' }))
      return
    }
  }

  next()
}

// Set up the session store and middleware
const sessionStore = new SequelizeStore({
  db: sequelize,
  table: 'Session',
})

let idseq = 0
const genid = () => {
  return `${Date.now()}-${++idseq}`
}

const sessionMiddleware = session({
  secret: ';b2x{EZ[#hQC@-Ny',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  genid,
})

const app = express()
app.set('query parser', 'extended')
app.set('etag', false)
// app.use('*p', (req, res, next) => { console.log(req.query); next() })

// Common middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(sessionMiddleware)

// Serve static assets
const STATIC_FOLDER = resolve(import.meta.dirname, '../../client/dist')
const INDEX_FILE = resolve(import.meta.dirname, '../../client/dist/index.html')
app.use(express.static(STATIC_FOLDER, {
  setHeaders(res, _path, _stat) {
    if (process.env.NODE_ENV !== 'production')
      res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
  },
}))

// API routes
if (process.env.NODE_ENV === 'production')
  app.use('/api', authCheck, validateJwtEmail)

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
app.use('/api/batch-categories', routes.batchCategories)
app.use('/api/batches', routes.batches)

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

// Serve the SPA for any unhandled route (it handles 404)
// TODO: Set a Content Security Policy to allow google things on the login page
app.get('*path', (_req, res) => {
  if (process.env.NODE_ENV !== 'production')
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
  res.sendFile(INDEX_FILE)
})

export default app
