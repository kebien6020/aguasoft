import * as socketio from 'socket.io'
import type { Socket } from 'socket.io'
import debug from 'debug'

const debugio = debug('app:socketio')

export const io = socketio()

io.on('connection', () => {
  debugio('Client connected')
})

io.on('close', () => {
  debugio('Client disconnected')
})

io.on('connection', socket => {
  socket.on('join', ({ room } = {}) => {
    typeof room === 'string' && joinRoom(socket, room)
  })
})

const joinRoom = (socket: Socket, room: string) => {
  debugio('Joining %s to room %s', socket.id, room)
  socket.join(room)
  socket.emit('joined', room)
  if (room.startsWith('frontend_')) return

  socket.on('state', (state: unknown) => {
    debugio('Receving state from device', { state })

    const fRoom = `frontend_${room}`

    debugio('Sending state to frontend room', { room: fRoom })
    io.to(fRoom).emit('state', state)
  })
}
