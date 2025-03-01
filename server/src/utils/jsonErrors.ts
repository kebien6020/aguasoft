import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from 'express-jwt'
import * as Sequelize from 'sequelize'

const hasStatus = (obj: unknown): obj is { status: number } => {
  return (
    typeof obj === 'object'
    && obj !== null
    && 'status' in obj
    && typeof (obj as { status: unknown }).status === 'number'
  )
}

export default function jsonErrorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  try {
    interface ErrorResponse {
      message: string
      code: string
      errors?: unknown
    }

    let response: ErrorResponse = {
      message: 'Unknown error',
      code: 'unknown_error',
    }

    if (!error || !(error instanceof Error)) {
      response = {
        message: 'Unknown error',
        code: 'unknown_error',
      }
    } else if (error instanceof Sequelize.ValidationError) {
      response = {
        message: 'One or more database contraints did not pass',
        code: 'validation_error',
        errors: (error).errors,
      }
    } else if (error instanceof UnauthorizedError) {
      response = {
        message: (error).message,
        code: 'unauthorized_error',
        errors: [error],
      }
    } else if (error instanceof Error) {
      response = { ...error, code: error.name, message: error.message }
    }

    if (process.env.NODE_ENV !== 'test')
      console.log(req.url, response, error)


    if (hasStatus(error))
      res.status(error.status)


    res.json({ success: false, error: response })
  } catch (err) {
    console.error('Error while handling error', err)
    console.error('The original error was', error)
  }
}
