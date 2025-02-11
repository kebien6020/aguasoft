/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ChangeEvent, Component, KeyboardEvent } from 'react'
import { Theme } from '@mui/material/styles'

import { StyleRulesCallback } from '@mui/styles'
import withStyles from '@mui/styles/withStyles'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import { fetchJsonAuth, isErrorResponse } from '../utils'
import Auth from '../Auth'
import { withUser, WithUserProps } from '../hooks/useUser'

interface User {
  id: number
  name: string
  code: string
  role: string
}

export interface LoginProps {
  auth: Auth
  onSuccess?: () => unknown
  onFailure?: () => unknown
  adminOnly?: boolean
  text?: string
  buttonColor?: string
}

type LoginPropsAll = LoginProps & PropClasses & WithUserProps

interface LoginState {
  userId: number | null
  checked: boolean
  users: User[] | null
  password: string
  errorLogin: boolean
}

type InputEvent = ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

class Login extends Component<LoginPropsAll, LoginState> {
  constructor(props: LoginPropsAll) {
    super(props)

    this.state = {
      userId: null,
      checked: false,
      users: null,
      password: '',
      errorLogin: false,
    }
  }

  async componentDidMount() {
    let users = await fetchJsonAuth<User[]>('/api/users', this.props.auth)

    if (isErrorResponse(users))
      return


    if (this.props.adminOnly === true)
      users = users.filter(user => user.role === 'admin')


    this.setState({ users, userId: users[0].id })
  }

  handleUserChange = (event: SelectChangeEvent) => {
    const userId = event.target.value === 'none'
      ? null
      : Number(event.target.value)

    this.setState({ userId })
  }

  handleSubmit = async () => {
    this.setState({ errorLogin: false })

    const { state, props } = this
    interface CheckResponse {
      result: boolean
    }
    const check = await fetchJsonAuth<CheckResponse>('/api/users/check', props.auth, {
      method: 'post',
      body: JSON.stringify({
        id: state.userId,
        password: state.password,
      }),
    })

    if (isErrorResponse(check)) {
      console.error(check)
      return
    }

    this.setState({ errorLogin: !check.result })

    // Reload the user that propagates through context
    this.props.user?.refresh()

    if (check.result) {
      if (props.onSuccess) props.onSuccess()
    } else {
      if (props.onFailure) props.onFailure()
    }
  }

  handlePasswordChange = (event: InputEvent) => {
    const password = event.target.value
    this.setState({
      password,
      errorLogin: false, // Clean error message on any modifications
    })
  }

  handleEnterAnywhere = (event: KeyboardEvent) => {
    if (event.key === 'Enter')
      void this.handleSubmit()

  }

  getDisplayName = (user: User) => {
    return `(${user.code}) ${user.name}`
  }

  render() {
    const { state, props } = this
    const { classes } = this.props
    return (
      <Grid container spacing={3} className={classes.container}
        onKeyPress={this.handleEnterAnywhere}>
        <Grid item xs={12} md={6} lg={4} className={classes.elemContainer}>
          <FormControl fullWidth className={classes.formControl} margin='dense' variant='standard'>
            <InputLabel>Usuario</InputLabel>
            <Select
              fullWidth
              className={classes.field}
              value={state.userId === null ? 'none' : String(state.userId)}
              onChange={this.handleUserChange}
            >
              {state.users
                ? state.users.map((user, key) =>
                  <MenuItem key={key} value={user.id}>
                    ({user.code}) {user.name}
                  </MenuItem>
                )
                : <MenuItem value='none'>Cargando...</MenuItem>
              }
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} lg={4} className={classes.elemContainer}>
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              fullWidth
              value={state.password}
              onChange={this.handlePasswordChange}
              label="Contraseña"
              className={classes.field}
              type="password"
              margin="dense"
              error={state.errorLogin}
              helperText={state.errorLogin ? 'Contraseña erronea' : null}
              variant='standard'
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12} lg={4} className={classes.elemContainer}>
          <Button
            size='large'
            variant='contained'
            color='primary'
            fullWidth
            className={classes.button}
            onClick={this.handleSubmit}
            style={{
              backgroundColor: props.buttonColor || undefined,
            }}
          >
            {props.text || 'Registrar'}
          </Button>
        </Grid>
      </Grid>
    )
  }
}

const styles: StyleRulesCallback<Theme, LoginProps> = _theme => ({
  container: {
    marginTop: 0,
  },
  elemContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  button: {
    // marginTop: theme.spacing.unit * 4,
  },
})

export default withUser(withStyles(styles)(Login))
