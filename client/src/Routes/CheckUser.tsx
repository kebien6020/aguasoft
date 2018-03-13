import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Button from 'material-ui/Button'
import { FormControl } from 'material-ui/Form'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import Modal from 'material-ui/Modal'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'

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
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>

class CheckUser extends React.Component<CheckUserProps, CheckUserState> {

  constructor(props: CheckUserProps) {
    super(props)

    this.state = {
      userId: null,
      checked: false,
      users: null,
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

  handleContinue = () => {
    this.setState({ checked: true })
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
                label="Contraseña"
                className={classes.field}
                type="password"
                margin="normal"
                inputProps={{ inputMode: 'numeric' }}
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
