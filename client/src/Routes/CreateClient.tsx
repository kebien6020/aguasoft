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
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import IconButton from '@material-ui/core/IconButton'

import DeleteIcon from '@material-ui/icons/Delete'

import { AuthRouteComponentProps } from '../AuthRoute'
import LoadingScreen from '../components/LoadingScreen'
import { fetchJsonAuth, money } from '../utils'
import Layout from '../components/Layout'
import ResponsiveContainer from '../components/ResponsiveContainer'
import PricePicker from '../components/PricePicker'
import { IncompletePrice } from '../components/PricePicker'
import { Product } from '../models'
import Alert from '../components/Alert'

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

interface PriceError {
  priceName: string
  productName: string
}

interface UserError {
  success: false
  error: {
    message: string
    code: string
  }
}

function isUserError(u: User | UserError): u is UserError {
  return (u as UserError).success === false
}

interface State {
  user: User
  code: string
  name: string
  defaultCash: 'true' | 'false'
  products: Product[]
  prices: IncompletePrice[]
  done: boolean
  errorCreating: boolean
  errorDuplicatedPrice: PriceError | null
  errorNoUser: boolean
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='h6'>{props.children}</Typography>
  </div>
)

interface DuplicatedPriceDialogProps {
  priceError: PriceError | null
  onClose: () => void
}

const DuplicatedPriceDialog = (props: DuplicatedPriceDialogProps) => (
  props.priceError !== null ?
    <Dialog
      open={props.priceError !== null}
      onClose={props.onClose}
    >
      <DialogTitle>Precio Duplicado</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Ya existe un precio llamado "{props.priceError.priceName}"
          para el producto {props.priceError.productName}, por favor elimine
          el precio anterior si desea cambiarlo.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color='primary'>Aceptar</Button>
      </DialogActions>
    </Dialog>
    : null
)

type ValChangeEvent = { target: { value: string } }

class CreateClient extends React.Component<Props, State> {

  state = {
    user: null as User,
    code: '',
    name: '',
    defaultCash: 'false' as 'true' | 'false',
    products: [] as Product[],
    prices: [] as IncompletePrice[],
    done: false,
    errorCreating: false,
    errorDuplicatedPrice: null as PriceError,
    errorNoUser: false,
  }

  async componentWillMount() {
    const { props } = this
    const promises : [
      Promise<User | UserError>,
      Promise<ClientDefaults>,
      Promise<Product[]>
    ] = [
      fetchJsonAuth('/api/users/getCurrent', props.auth),
      fetchJsonAuth('/api/clients/defaultsForNew', props.auth),
      fetchJsonAuth('/api/products/', props.auth),
    ]
    const [ user, defaults, products ] = await Promise.all(promises)

    if (user) {
      if (isUserError(user)) {
        this.setState({errorNoUser: true})
        return
      }

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
    price.productId = Number(price.productId)
    price.value = String(price.value)
    const prevPrices = this.state.prices
    const duplicated = prevPrices.findIndex(pr =>
      pr.name === price.name && pr.productId === price.productId
    ) !== -1

    if (duplicated) {
      const products = this.state.products
      const productName = products.find(p => p.id === price.productId).name

      this.setState({errorDuplicatedPrice: {
        priceName: price.name,
        productName: productName,
      }})

      return
    }

    this.setState({
      prices: [...prevPrices, price]
    })
  }

  handleCreate = async () => {
    const { props, state } = this
    const res = await fetchJsonAuth('/api/clients/create', props.auth, {
      method: 'post',
      body: JSON.stringify({
        name: state.name,
        code: state.code,
        defaultCash: state.defaultCash === 'true',
        prices: state.prices,
      })
    })

    if (!res.success) {
      this.setState({errorCreating: true})
      console.error(res)
      return
    }

    this.setState({done: true})
  }

  handlePriceDelete = (priceIndex: number) => {
    const prevPrices = this.state.prices

    this.setState({ prices: [
      ...prevPrices.slice(0, priceIndex),
      ...prevPrices.slice(priceIndex + 1),
    ]})
  }

  render() {
    const { state, props } = this

    const redirectToLogin = () =>
      <Redirect to='/check?next=/clients/new&admin=true' push={false} />

    if (state.errorNoUser) {
      return redirectToLogin()
    }

    if (state.user === null) {
      return <LoadingScreen text='Verificando usuario...' />
    }

    if (state.products.length === 0) {
      return <LoadingScreen text='Cargando productos...' />
    }

    if (state.user.role !== 'admin') {
      return redirectToLogin()
    }

    if (state.done) {
      return <Redirect to='/' push />
    }

    const { classes } = props

    return (
      <Layout>
        <DuplicatedPriceDialog
          priceError={state.errorDuplicatedPrice}
          onClose={() => this.setState({errorDuplicatedPrice: null})}
        />
        <ResponsiveContainer variant='normal'>
          <Paper className={classes.paper}>
            <Title {...props}>Crear Nuevo Cliente</Title>
            {state.errorCreating &&
              <Alert
                type='error'
                message='Error creando el cliente favor intentarlo nuevamente'
              />
            }
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
                <IconButton
                  className={classes.deleteButton}
                  onClick={() => this.handlePriceDelete(idx)}
                >
                  <DeleteIcon />
                </IconButton>
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
              onClick={this.handleCreate}
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
    position: 'relative'
  },
  deleteButton: {
    color: 'red',
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: theme.spacing.unit * 4,
  },
})

export default withStyles(styles)(CreateClient)
