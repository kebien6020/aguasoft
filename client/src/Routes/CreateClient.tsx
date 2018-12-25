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
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'

import { AuthRouteComponentProps } from '../AuthRoute'
import LoadingScreen from '../components/LoadingScreen'
import { fetchJsonAuth, money } from '../utils'
import Layout from '../components/Layout'
import ResponsiveContainer from '../components/ResponsiveContainer'
import PricePicker from '../components/PricePicker'
import { IncompletePrice } from '../components/PricePicker'
import { Product } from '../models'

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
  products: Product[]
  prices: IncompletePrice[]
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='h6'>{props.children}</Typography>
  </div>
)

type ValChangeEvent = { target: { value: string } }

class CreateClient extends React.Component<Props, State> {

  state = {
    user: null as User,
    code: '',
    name: '',
    defaultCash: 'false' as 'false',
    products: [] as Product[],
    prices: [] as IncompletePrice[],
  }

  async componentWillMount() {
    const { props } = this
    const promises : [
      Promise<User>,
      Promise<ClientDefaults>,
      Promise<Product[]>
    ] = [
      fetchJsonAuth('/api/users/getCurrent', props.auth),
      fetchJsonAuth('/api/clients/defaultsForNew', props.auth),
      fetchJsonAuth('/api/products/', props.auth),
    ]
    const [ user, defaults, products ] = await Promise.all(promises)

    if (user) {
      this.setState({user})
    }

    if (defaults) {
      this.setState({code: defaults.code})
    }

    if (products) {
      this.setState({products})
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

  handleNewPrice = (price: IncompletePrice) => {
    this.setState({
      prices: [...this.state.prices, price]
    })
  }

  render() {
    const { state, props } = this
    if (state.user === null) {
      return <LoadingScreen text='Verificando usuario...' />
    }

    if (state.products.length === 0) {
      return <LoadingScreen text='Cargando productos...' />
    }

    if (state.user.role !== 'admin') {
      return <Redirect to='/check?next=/clients/new&admin=true' push={false} />
    }

    const { classes } = props

    return (
      <Layout>
        <ResponsiveContainer variant='normal'>
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
          <>
            {state.prices.map((pr, idx) => (
              <Paper className={classes.paper} key={idx}>
                {pr.name !== 'Base' && <>
                  <Typography variant='subtitle2'>{pr.name}</Typography>
                  <Divider />
                </>}
                <Typography variant='body1'>
                  {state.products.find(p => p.id === pr.productId).name} a {money(Number(pr.value))}
                </Typography>
              </Paper>
            ))}
          </>
          <PricePicker
            clientName={state.name}
            products={state.products}
            onNewPrice={this.handleNewPrice}
          />
          <Paper className={classes.paper}>
            <Button
              variant='contained'
              color='primary'
              fullWidth={true}
            >
              Crear Cliente
            </Button>
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
