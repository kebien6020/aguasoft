import { Navigate } from 'react-router'
import makeStyles from '@mui/styles/makeStyles'

import Modal from '@mui/material/Modal'

import Layout from '../components/Layout'
import Login from '../components/Login'
import { parseParams } from '../utils'
import { useState } from 'react'
import useUser from '../hooks/useUser'
import { Theme } from '../theme'

const CheckUser = () => {
  const classes = useStyles()
  const [checked, setChecked] = useState(false)

  const params = parseParams(window.location.search)
  const redirectUrl = params.next ? params.next : '/sell'
  const adminOnly = params.admin ? params.admin === 'true' : false
  const userFromContext = useUser()

  if (checked && userFromContext?.loggedIn)
    return <Navigate to={redirectUrl} />

  return (
    <Layout title='Verificación requerida'>
      <Modal
        open={true}
      >
        <div className={classes.paper}>
          <Login
            adminOnly={adminOnly}
            onSuccess={() => {
              setChecked(true) 
            }}
            text='Continuar'
          />
        </div>
      </Modal>
    </Layout>
  )
}

const useStyles = makeStyles(
  ({ palette, spacing, shadows }: Theme) => ({
    paper: {
      position: 'absolute',
      width: '80%',
      backgroundColor: palette.background.paper,
      boxShadow: shadows[5],
      padding: spacing(4),
      left: '50%',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)',
    },
    field: {
      marginTop: spacing(2),
    },
    title: {
      marginBottom: spacing(4),
    },
    button: {
      marginTop: spacing(4),
    },
  }))

export default CheckUser
