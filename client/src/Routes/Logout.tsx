import useAuth from '../hooks/useAuth'
import { useEffect } from 'react'
import { useHistory } from 'react-router'

const Logout = () => {
  const auth = useAuth()
  const history = useHistory()

  useEffect(() => {
    auth.logout()
    history.push('/')
  }, [auth, history])

  return (<p>Cerrando sesion</p>)
}

export default Logout
