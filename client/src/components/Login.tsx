import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { makeStyles } from '@mui/styles'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

import { fetchJsonAuth, isErrorResponse } from '../utils'
import useUser from '../hooks/useUser'
import useAuth from '../hooks/useAuth'
import { optionsFromUsers, useUsers } from '../hooks/api/useUsers'

export interface LoginProps {
  onSuccess?: () => unknown
  onFailure?: () => unknown
  adminOnly?: boolean
  text?: string
  buttonColor?: string
}

type InputEvent = ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

const Login = (props: LoginProps) => {
  const {
    onSuccess,
    onFailure,
    adminOnly,
    text,
    buttonColor,
  } = props
  const classes = useStyles()
  const auth = useAuth()
  const user = useUser()
  const [users] = useUsers()
  const userOpts = useMemo(() => {
    let tmpUsers = users
    if (adminOnly)
      tmpUsers = users?.filter(u => u.role === 'admin')

    return optionsFromUsers(tmpUsers)
  }, [adminOnly, users])

  const [errorLogin, setErrorLogin] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [password, setPassword] = useState('')

  // Pre-select first user
  useEffect(() => {
    if (userOpts && userOpts.length > 0)
      setUserId(Number(userOpts[0].value))
  }, [userOpts])

  const handleSubmit = useCallback(() => {
    (async () => {
      setErrorLogin(false)

      interface CheckResponse {
        result: boolean
      }
      const check = await fetchJsonAuth<CheckResponse>('/api/users/check', auth, {
        method: 'post',
        body: JSON.stringify({
          id: userId,
          password: password,
        }),
      })

      if (isErrorResponse(check)) {
        console.error(check)
        return
      }

      setErrorLogin(!check.result)

      // Reload the user that propagates through context
      user?.refresh()

      if (check.result)
        onSuccess?.()
      else
        onFailure?.()
    })()
  }, [auth, onFailure, onSuccess, password, user, userId])

  const handleEnterAnywhere = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter')
      handleSubmit()

  }, [handleSubmit])

  const handleUserChange = useCallback((event: SelectChangeEvent) => {
    const userId = event.target.value === 'none'
      ? null
      : Number(event.target.value)

    setUserId(userId)
  }, [setUserId])


  const handlePasswordChange = useCallback((event: InputEvent) => {
    const password = event.target.value
    setErrorLogin(false) // Clean error message on any modifications
    setPassword(password)
  }, [])

  return (
    <Grid
      container
      spacing={3}
      className={classes.container}
      onKeyDown={handleEnterAnywhere}
    >
      <Grid size={{ xs: 12, md: 6, lg: 4 }} className={classes.elemContainer}>
        <FormControl fullWidth margin='dense' variant='standard'>
          <InputLabel>Usuario</InputLabel>
          <Select
            fullWidth
            value={userId === null ? 'none' : String(userId)}
            onChange={handleUserChange}
          >
            {userOpts
              ? userOpts.map((user) =>
                <MenuItem key={user.value} value={user.value}>
                  {user.label}
                </MenuItem>)
              : <MenuItem value='none'>Cargando...</MenuItem>
            }
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }} className={classes.elemContainer}>
        <FormControl fullWidth>
          <TextField
            fullWidth
            value={password}
            onChange={handlePasswordChange}
            label="Contraseña"
            type="password"
            margin="dense"
            error={errorLogin}
            helperText={errorLogin ? 'Contraseña erronea' : null}
            variant='standard'
          />
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }} className={classes.elemContainer}>
        <Button
          size='large'
          variant='contained'
          color='primary'
          fullWidth
          onClick={handleSubmit}
          style={{
            backgroundColor: buttonColor || undefined,
          }}
        >
          {text || 'Registrar'}
        </Button>
      </Grid>
    </Grid>
  )
}

const useStyles = makeStyles({
  container: {
    marginTop: 0,
  },
  elemContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
})

export default Login
