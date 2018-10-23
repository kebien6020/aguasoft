import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import Layout from '../components/Layout'
import { fetchJsonAuth } from '../utils'
import { AuthRouteComponentProps } from '../AuthRoute'

const styles: StyleRulesCallback =
  ({ palette, spacing, shadows }: Theme) => ({
    paper: {
      position: 'absolute',
      width: spacing.unit * 48,
      backgroundColor: palette.background.paper,
      boxShadow: shadows[5],
      padding: spacing.unit * 4,
      left: '50%',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)'
    },
    field: {
      marginTop: spacing.unit * 2,
    },
    title: {
      marginBottom: spacing.unit * 4,
    },
    button: {
      marginTop: spacing.unit * 4,
    },
  })

interface CheckUserProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface User {
  id: number
  name: string
  code: string
}

interface CheckUserState {
  userId: number
  checked: boolean
  users: User[]
  password: string
  errorLogin: boolean
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

class CheckUser extends React.Component<CheckUserProps, CheckUserState> {

  constructor(props: CheckUserProps) {
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

  handleContinue = async () => {
    this.setState({ errorLogin: false })

    const { state } = this
    const check = await fetchJsonAuth('/api/users/check', this.props.auth, {
      method: 'post',
      body: JSON.stringify({
        id: state.userId,
        password: state.password
      })
    })

    this.setState({ checked: check.result, errorLogin: !check.result })
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
    const { props, state } = this
    const { classes } = props
    if (state.checked) {
      return <Redirect to='/sell' push />
    }
    return (
      <Layout>
        <Modal
          open={true}
          onKeyPress={(event) => event.key === 'Enter' && this.handleContinue()}
        >
          <div className={classes.paper}>
            <Typography variant="title" className={classes.title}>
              Usuario
          </Typography>
            <FormControl fullWidth className={classes.formControl}>
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
            <FormControl fullWidth className={classes.formControl}>
              <TextField
                fullWidth
                value={state.password}
                onChange={this.handlePasswordChange}
                label="Contraseña"
                className={classes.field}
                type="password"
                margin="normal"
                inputProps={{ inputMode: 'numeric' }}
                error={state.errorLogin}
                helperText={state.errorLogin ? 'Contraseña erronea' : null}
              />
            </FormControl>
            <Button
              size='large'
              variant='raised'
              color='primary'
              fullWidth
              className={classes.button}
              onClick={this.handleContinue}
            >
              Continuar
          </Button>
          </div>
        </Modal>
      </Layout>
    )
  }
}

export default withStyles(styles)(CheckUser)
