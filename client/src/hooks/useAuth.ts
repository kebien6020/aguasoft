import { use } from 'react'

import AuthContext from '../AuthContext'
import Auth from '../Auth'

const useAuth = (): Auth => {
  const auth = use(AuthContext)
  return auth
}

export default useAuth
