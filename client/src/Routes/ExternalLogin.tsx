import * as React from 'react'

import Layout from '../components/Layout'
import { CenterFullscreen } from '../components/utils'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router'

const ExternalLogin = () => {
  const navigate = useNavigate()

  return (
    <Layout title='Inicio de Sesión'>
      <CenterFullscreen>

        <GoogleLogin
          onSuccess={res => {
            localStorage.setItem('access_token', res.credential ?? '')
            localStorage.setItem('expires_at', JSON.stringify(new Date().getTime() + 3600 * 1000))
            navigate('/')
          }}
          onError={() => {
            console.error('Login Failed')
          }}
          theme='filled_blue'
          size='large'
          ux_mode='redirect'
        />
      </CenterFullscreen>
    </Layout>
  )
}

export default ExternalLogin
