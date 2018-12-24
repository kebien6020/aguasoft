import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import { Redirect } from 'react-router-dom'

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import { AuthRouteComponentProps } from '../AuthRoute'
import LoadingScreen from '../components/LoadingScreen'
import { fetchJsonAuth } from '../utils'
import Layout from '../components/Layout'
import ResponsiveContainer from '../components/ResponsiveContainer'

interface User {
  id: number
  name: string
  code: string
  role: string
}

interface ClientDefaults {
  code: string
}

interface CreateClientProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface CreateClientState {
  user: User
  code: string
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='h6'>{props.children}</Typography>
  </div>
)

class CreateClient extends React.Component<CreateClientProps, CreateClientState> {

  state = {
    user: null as User,
    code: ''
  }

  async componentWillMount() {
    const { props } = this
    const promises : [Promise<User>, Promise<ClientDefaults>] = [
      fetchJsonAuth('/api/users/getCurrent', props.auth),
      fetchJsonAuth('/api/clients/defaultsForNew', props.auth),
    ]
    const [ user, defaults ] = await Promise.all(promises)

    if (user) {
      this.setState({user})
    }

    if (defaults) {
      this.setState({code: defaults.code})
    }
  }

  handleChange = (name: keyof CreateClientState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prevState: CreateClientState) => ({
        ...prevState,
        [name]: event.target.value,
    }))
  }

  render() {
    const { state, props } = this
    if (state.user === null) {
      return <LoadingScreen text='Verificando usuario...' />
    }

    if (state.user.role !== 'admin') {
      return <Redirect to='/check?next=/clients/new&admin=true' push={false} />
    }

    const { classes } = props

    return (
      <Layout>
        <ResponsiveContainer variant='wide'>
          <Paper>
            <Title {...props}>Crear Nuevo Cliente</Title>
            <form className={classes.form} autoComplete='off'>
              <TextField
                id='code'
                label='Código'
                margin='normal'
                fullWidth
                value={state.code}
                onChange={this.handleChange('code')}
              />
              <TextField
                id='name'
                label='Nombre'
                margin='normal'
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel htmlFor='defaultCash'>Pago</InputLabel>
                <Select
                  inputProps={{
                    name: 'defaultCash',
                    id: 'defaultCash',
                  }}
                >
                  <MenuItem value='false'>Pago Postfechado</MenuItem>
                  <MenuItem value='true'>Pago en Efectivo</MenuItem>
                </Select>
              </FormControl>
            </form>
          </Paper>
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  title: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    '& > *': {
      textAlign: 'center',
    },
  },
  form: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
  }
})

export default withStyles(styles)(CreateClient)
