import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import { FormControl } from 'material-ui/Form'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import Grid from 'material-ui/Grid'

import { fetchJsonAuth } from '../utils'
import Auth from '../Auth'

interface User {
  id: number
  name: string
  code: string
}

interface LoginProps {
  auth: Auth
  onSuccess?: () => any
  onFailure?: () => any
}

type LoginPropsAll = LoginProps & PropClasses

interface LoginState {
  userId: number
  checked: boolean
  users: User[]
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
    const users: User[] = await fetchJsonAuth('/api/users', this.props.auth)

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

  getDisplayName = (user: User) => {
    return `(${user.code}) ${user.name}`
  }

  render() {
    const { state } = this
    const { classes } = this.props
    return (
      <Grid container spacing={24} className={classes.container}>
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
              inputProps={{ inputMode: 'numeric' }}
              error={state.errorLogin}
              helperText={state.errorLogin ? 'Contraseña erronea' : null}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12} lg={4} className={classes.elemContainer}>
          <Button
            size='large'
            variant='raised'
            color='primary'
            fullWidth
            className={classes.button}
            onClick={this.handleSubmit}
          >
            Registrar
          </Button>
        </Grid>
      </Grid>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
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

// Explicit LoginProps type (note it is not LoginPropsAll) which lets
// users of this component know the props this accepts, without including
// the classes prop wich is injected right here
export default withStyles(styles)<LoginProps>(Login)
