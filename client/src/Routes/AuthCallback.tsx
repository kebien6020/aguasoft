import * as React from 'react'
import { useEffect, useState } from 'react'

import LoadingScreen from '../components/LoadingScreen'
import { useHistory } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { Button } from '@material-ui/core'

const AuthCallback = () => {
  const auth = useAuth()
  const history = useHistory()
  const [error, setError] = useState<string|undefined>(undefined)

  useEffect(() => {
    (async () => {
      try {
        await auth.handleAuthentication()
        history.push('/')
      } catch (err: unknown) {
        console.error('AuthCallback: error with authentication data', err)
        setError('Error al iniciar sesion')
      }
    })()
  }, [auth, history])

  const goHome = () => history.push('/')

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
