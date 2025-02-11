import type {
  ComponentType,
  FunctionComponent,
  ReactNode,
} from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { User } from '../models'
import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'
import useAuth from './useAuth'

type Result = {
  user: User | null
  isAdmin: boolean | null
  loggedIn: boolean | null
  refresh: () => void
}

type OnError = (error: ErrorResponse['error']) => unknown

export function useUserFetch(onError?: OnError): Result {
  const auth = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [nonce, refresh] = useReducer((prev: number) => prev + 1, 1)

  useEffect(() => {
    (async () => {
      const url = '/api/users/getCurrent'
      const user: ErrorResponse | User = await fetchJsonAuth(url, auth)

      if (!isErrorResponse(user)) {
        setUser(user)
        setLoggedIn(true)
      } else {
        onError?.(user.error)
        setLoggedIn(false)
      }
    })()
  }, [auth, onError, nonce])

  return { user, isAdmin: user && user.role === 'admin', loggedIn, refresh }
}

const UserContext = createContext<Result | null>(null)

export type UserProviderProps = { children: ReactNode }
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
  Component: ComponentType<P>
): FunctionComponent<Omit<P, 'user'>> {
  const WrappedComponent = (props: Omit<P, 'user'>) => (
    <UserContext.Consumer>
      {userInfo => <Component {...props as P} user={userInfo} />}
    </UserContext.Consumer>
  )

  return WrappedComponent
}
