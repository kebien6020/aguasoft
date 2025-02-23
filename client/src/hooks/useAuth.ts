import { useContext } from 'react'

import AuthContext from '../AuthContext'
import Auth from '../Auth'

const useAuth = (): Auth => {
  const auth = useContext(AuthContext)
  return auth
}

export default useAuth
