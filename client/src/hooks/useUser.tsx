import { useState, useEffect } from 'react'

import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'
import { User } from '../models'
import useAuth from './useAuth'


export default function useUser(onError?: (error: ErrorResponse["error"]) => any) {
  const auth = useAuth()
  const [user, setUser] = useState<User|null>(null)

  useEffect(() => {
    const updateUser = async () => {
      const url = '/api/users/getCurrent'
      const user: ErrorResponse | User = await fetchJsonAuth(url, auth)

      if (!isErrorResponse(user)) {
        setUser(user)
      } else {
        if (onError)
          onError(user.error)
      }
    }

    updateUser()
  }, [])

  return {user, isAdmin: user && user.role === 'admin'}
}
