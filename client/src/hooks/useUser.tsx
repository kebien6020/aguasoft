import { useState, useEffect } from 'react'

import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'
import { User } from '../models'
import useAuth from './useAuth'

type Result = {
  user: User | null
  isAdmin: boolean | null
}

type OnError = (error: ErrorResponse['error']) => unknown

export default function useUser(onError?: OnError): Result {
  const auth = useAuth()
  const [user, setUser] = useState<User|null>(null)

  useEffect(() => {
    (async () => {
      const url = '/api/users/getCurrent'
      const user: ErrorResponse | User = await fetchJsonAuth(url, auth)

      if (!isErrorResponse(user)) {
        setUser(user)
      } else {
        if (onError)
          onError(user.error)
      }
    })()
  }, [auth, onError])

  return { user, isAdmin: user && user.role === 'admin' }
}
