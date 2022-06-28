import ky from 'ky'
import Auth from '../Auth'
import useAuth from '../hooks/useAuth'
import { useMemo } from 'react'

export type Api = typeof ky

export const createApi = (auth: Auth): Api => ky.create({
  prefixUrl: '/api/',
  hooks: {
    beforeRequest: [req => req.headers.set('Authorization', 'bearer' + auth.getAccessToken())],
  },
  retry: 2,
})

export const useApi = (): Api => {
  const auth = useAuth()
  const api = useMemo(() => createApi(auth), [auth])
  return api
}
