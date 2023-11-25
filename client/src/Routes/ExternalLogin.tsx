import * as React from 'react'

import { useEffect } from 'react'
import Layout from '../components/Layout'
import { CenterFullscreen } from '../components/utils'

const ExternalLogin = () => {
  useEffect(() => {
    globalThis.loginHandler = loginHandler
  }, [])

  return (
    <Layout title='Inicio de Sesión'>
      <CenterFullscreen>
        <div id="g_id_onload"
          data-client_id="327533471227-niedralk7louhbv330rm2lk1r8mgcv9g.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="loginHandler"
          data-auto_prompt="false">
        </div>

        <div className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="filled_blue"
          data-text="signin_with"
          data-size="large"
          data-locale="es-419"
          data-logo_alignment="left"
          data-width="100">
        </div>
      </CenterFullscreen>
    </Layout>
  )
}

const loginHandler = (payload) => {
  console.log(payload)
  const jwt = payload.credential
  localStorage.access_token = jwt
  localStorage.expires_at = JSON.stringify(new Date().getTime() + 3600 * 1000)

  location.href = '/'
}

export default ExternalLogin
