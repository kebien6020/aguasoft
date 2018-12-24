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
import PricePicker from '../components/PricePicker'

interface User {
  id: number
  name: string
  code: string
  role: string
}

interface ClientDefaults {
  code: string
}

interface Props extends PropClasses, AuthRouteComponentProps<{}> {

}

interface State {
  user: User
  code: string
  name: string
  defaultCash: 'true' | 'false'
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='h6'>{props.children}</Typography>
  </div>
)

type ValChangeEvent = { target: { value: string } }

class CreateClient extends React.Component<Props, State> {

  state = {
    user: null,
    code: '',
    name: '',
    defaultCash: 'false',
  } as State // because reasons

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

  handleChange = (name: keyof State) => (event: ValChangeEvent) => {
    // Save value to a variable because it may change (synthetic events
    // may be re-used by react)
    const value = event.target.value
    this.setState((prevState: State) => ({
        ...prevState,
        [name]: value,
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
          <Paper className={classes.paper}>
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
                value={state.name}
                onChange={this.handleChange('name')}
              />
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='defaultCash'>Pago</InputLabel>
                <Select
                  inputProps={{
                    name: 'defaultCash',
                    id: 'defaultCash',
                  }}
                  onChange={this.handleChange('defaultCash')}
                  value={state.defaultCash}
                >
                  <MenuItem value='false'>Pago Postfechado</MenuItem>
                  <MenuItem value='true'>Pago en Efectivo</MenuItem>
                </Select>
              </FormControl>
            </form>
          </Paper>
          <Paper className={classes.paper}>
            <PricePicker />
          </Paper>
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  title: {
    '& > *': {
      textAlign: 'center',
    },
  },
  form: {
  },
  paper: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    paddingTop: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  }
})

export default withStyles(styles)(CreateClient)
