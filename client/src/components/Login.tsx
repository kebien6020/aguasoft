import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import { fetchJsonAuth } from '../utils'
import Auth from '../Auth'

interface User {
  id: number
  name: string
  code: string
  role: string
}

interface LoginProps {
  auth: Auth
  onSuccess?: () => any
  onFailure?: () => any
  adminOnly?: boolean
  text?: string
}

type LoginPropsAll = LoginProps & PropClasses

interface LoginState {
  userId: number | null
  checked: boolean
  users: User[] | null
  password: string
  errorLogin: boolean
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

class Login extends React.Component<LoginPropsAll, LoginState> {
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

  async componentWillMount() {
    let users: User[] = await fetchJsonAuth('/api/users', this.props.auth)

    if (this.props.adminOnly === true) {
      users = users.filter(user => user.role === 'admin')
    }

    this.setState({users, userId: users[0].id})
  }

  handleUserChange = (event: InputEvent) => {
    const userId = event.target.value === 'none' ?
     null :
     Number(event.target.value)

    this.setState({userId})
  }

  handleSubmit = async () => {
    this.setState({ errorLogin: false })

    const { state, props } = this
    const check = await fetchJsonAuth('/api/users/check', props.auth, {
      method: 'post',
      body: JSON.stringify({
        id: state.userId,
        password: state.password
      })
    })

    this.setState({ errorLogin: !check.result })

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
      errorLogin: false,  // Clean error message on any modifications
    })
  }

  handleEnterAnywhere = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.handleSubmit()
    }
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
          <FormControl fullWidth className={classes.formControl} margin='dense'>
            <InputLabel>Usuario</InputLabel>
            <Select
              fullWidth
              className={classes.field}
              value={state.userId || 'none'}
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

export default withStyles(styles)(Login)
