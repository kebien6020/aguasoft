import * as socketio from 'socket.io'
import debug from 'debug'

const debugio = debug('app:socketio')

export const io = socketio()

io.on('connection', () => {
  debugio('Client connected')
})

io.on('close', () => {
  debugio('Client disconnected')
})
