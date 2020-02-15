import { Request, Response, NextFunction } from 'express'
import * as Sequelize from 'sequelize'
import { UnauthorizedError } from 'express-jwt'

export default function jsonErrorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  try {
    interface ErrorResponse {
      message: string
      code: string
      errors?: any
    }

    let response: ErrorResponse = {
      message: 'Unknown error',
      code: 'unknown_error',
    }

    if (!error || !(error instanceof Error))
      response = {
        message: 'Unknown error',
        code: 'unknown_error',
      }
    else if (error instanceof Sequelize.ValidationError)
      response = {
        message: 'One or more database contraints did not pass',
        code: 'validation_error',
        errors: (error as Sequelize.ValidationError).errors
      }
    else if (error as Error instanceof UnauthorizedError)
      response = {
        message: (error as Error).message,
        code: 'unauthorized_error',
        errors: error
      }
    else if (error instanceof Error)
      response = {...error, code: error.name}
    else if ((error as Error).name === 'Error')
      response = {
        message: (error as Error).message,
        code: 'unknown_error',
      }
    else if ((error as any).message && (error as any).name)
      response = {
        message: (error as any).message,
        code: (error as any).name
      }

    console.log(req.url, response, error)

    if (typeof (error as any).status === 'number') {
      res.status(error.status)
    }

    res.json({ success: false, error: response })
  } catch (err) {
    console.error('Error while handling error', err)
    console.error('The original error was', error)
  }
}
