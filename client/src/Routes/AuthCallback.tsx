import { useEffect, useState } from 'react'

import LoadingScreen from '../components/LoadingScreen'
import useAuth from '../hooks/useAuth'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const AuthCallback = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    (async () => {
      try {
        await auth.handleAuthentication()
        navigate('/')
      } catch (err: unknown) {
        console.error('AuthCallback: error with authentication data', err)
        setError('Error al iniciar sesion')
      }
    })()
  }, [auth, navigate])

  const goHome = () => navigate('/')

  if (error) {
    return (
      <LoadingScreen text={error}>
        <Button variant='contained' color='primary' onClick={goHome}>Volver al inicio</Button>
      </LoadingScreen>
    )
  }

  return (
    <LoadingScreen text='Iniciando sesión…' />
  )
}

export default AuthCallback
