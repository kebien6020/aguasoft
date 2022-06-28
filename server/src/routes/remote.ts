import { Router } from 'express'
import { wrap } from '../wrap'
import { io } from '../io'
import debug from 'debug'

const debugRemote = debug('app:remote')

const router = Router()
export default router

router.post('/action/:device/:action', wrap(req => {
  const { device, action } = req.params
  io.to(device).emit('action', { action, ...req.body })
  return {}
}))

router.post('/update/:device/state', wrap(req => {
  const state = req.body as Record<string, unknown>
  const device = req.params.device

  debugRemote('Receving state from device', { state })

  const fRoom = `frontend_${device}`

  debugRemote('Sending state to frontend room', { room: fRoom })
  io.to(fRoom).emit('state', state)
  return {}
}))
