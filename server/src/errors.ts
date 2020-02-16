export class Error404 extends Error {
  name = 'not_found'
  status = 404

  constructor(message?: string) {
    super(message)
    this.message = message || 'Route does not exist'
  }
}
