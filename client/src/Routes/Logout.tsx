import { useNavigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import { useEffect } from 'react'

const Logout = () => {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    auth.logout()
    navigate('/')
  }, [auth, navigate])

  return (<p>Cerrando sesion</p>)
}

export default Logout
