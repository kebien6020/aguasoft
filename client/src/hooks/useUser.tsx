import { useState, useEffect } from 'react'

import Auth from '../Auth'
import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'
import { User } from '../models'


export default function useUser(auth: Auth, onError?: (error: ErrorResponse["error"]) => any) {
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
