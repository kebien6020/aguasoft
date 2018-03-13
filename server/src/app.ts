import * as path from 'path'
import * as jwt from 'express-jwt'
import * as jwks from 'jwks-rsa'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as routes from './routes'
import jsonErrorHandler from './utils/jsonErrors'


// Set up the jwt middleware
const authCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://kevinpena.auth0.com/.well-known/jwks.json'
  }),
    // This is the identifier we set when we created the API
  audience: 'https://soft.agualaif.com',
  issuer: 'https://kevinpena.auth0.com/',
  algorithms: ['RS256']
})

const app = express()

// Common middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

// Serve static assets
const STATIC_FOLDER = path.resolve(__dirname, '../../client/dist')
const INDEX_FILE = path.resolve(__dirname, '../../client/index.html')
app.use(express.static(STATIC_FOLDER))

// API routes
app.use('/api/users', authCheck, routes.users)

// Error handler for any error thrown
// in any route or middleware
app.use(jsonErrorHandler)

// Serve the SPA for any unhandled route (it handles 404)
app.get('*', (req, res) => {
  res.sendFile(INDEX_FILE)
})

export default app
