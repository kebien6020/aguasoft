import { ErrorResponse } from '../utils'

export class FetchError extends Error { }

export class ServerError extends FetchError {
  readonly code: string // Not status code. Error slug coming from the server

  constructor(res: ErrorResponse) {
    super(res.error.message)
    this.code = res.error.code
  }
}

export class NetworkError extends FetchError {
  constructor(resourceDesc: string) {
    super(`Error de conexión al ${resourceDesc}`)
  }
}
