import React, { useContext, useEffect, useReducer, useState } from 'react'
import { User } from '../models'
import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'
import useAuth from './useAuth'

type Result = {
  user: User | null
  isAdmin: boolean | null
  refresh: () => void
}

type OnError = (error: ErrorResponse['error']) => unknown

export function useUserFetch(onError?: OnError): Result {
  const auth = useAuth()
  const [user, setUser] = useState<User|null>(null)
  const [nonce, refresh] = useReducer((prev: number) => prev + 1, 1)

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
  }, [auth, onError, nonce])

  return { user, isAdmin: user && user.role === 'admin', refresh }
}

const UserContext = React.createContext<Result|null>(null)

export type UserProviderProps = { children: React.ReactNode }
export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const userInfo = useUserFetch()

  return <UserContext.Provider value={userInfo}>{children}</UserContext.Provider>
}

export default function useUser(): Result | null {
  return useContext(UserContext)
}

export interface WithUserProps {
  user: Result | null
}
export function withUser<P extends WithUserProps>(
  Component: React.ComponentType<P>
): React.FunctionComponent<Omit<P, 'user'>> {
  const WrappedComponent = (props: Omit<P, 'user'>) => (
    <UserContext.Consumer>
      {userInfo => <Component {...props as P} user={userInfo} />}
    </UserContext.Consumer>
  )

  return WrappedComponent
}
