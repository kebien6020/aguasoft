import app from './app.js'
import { Server } from 'socket.io'
import debug from 'debug'

const debugio = debug('app:socketio')

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test')
    console.log('  App is running at http://localhost:%d', PORT)

})

const io = new Server(server)

io.on('connection', () => {
  debugio('Client connected')
})

io.on('close', () => {
  debugio('Client disconnected')
})

export { io, server }
