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
import { Product, Client, Price } from '../models'
import Alert from '../components/Alert'
import adminOnly from '../hoc/adminOnly'

interface ClientDefaults {
  code: string
}

interface DetailedClient extends Client {
  Prices: Price[]
  notes: string
}

interface ClientError {
  success: false
  error: {
    message: string
    code: string
  }
}

function isClientError(u: Client | ClientDefaults | ClientError): u is ClientError {
  return (u as ClientError).success === false
}

interface Params {
  id?: string
}

interface Props extends PropClasses, AuthRouteComponentProps<Params> {

}

interface PriceError {
  priceName: string
  productName: string
}

interface State {
  code: string
  name: string
  defaultCash: 'true' | 'false'
  notes: string
  products: Product[]
  prices: IncompletePrice[]
  done: boolean
  errorSubmitting: boolean
  errorDuplicatedPrice: PriceError | null
  mode: 'CREATE' | 'EDIT'
  editId: string | null
  error: string | null // Generic error occured
  errorEmptyName: boolean
  errorEmptyCode: boolean
  errorDuplicatedField: 'name' | 'code' | null
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

class ClientEditor extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const { params } = this.props.match

    const mode = params.id === undefined ? 'CREATE' : 'EDIT'
    const editId = params.id !== undefined ? params.id : null

    this.state = {
      code: '',
      name: '',
      defaultCash: 'false' as 'true' | 'false',
      notes: '',
      products: [] as Product[],
      prices: [] as IncompletePrice[],
      done: false,
      errorSubmitting: false,
      errorDuplicatedPrice: null,
      mode,
      editId,
      error: null,
      errorEmptyName: false,
      errorEmptyCode: false,
      errorDuplicatedField: null,
    }
  }


  async componentDidMount() {
    const { props, state } = this
    const promises: [Promise<ClientDefaults|Client|ClientError>, Promise<Product[]>] = [
      state.mode === 'CREATE' ?
        fetchJsonAuth('/api/clients/defaultsForNew', props.auth) as Promise<ClientDefaults|ClientError> :
        fetchJsonAuth('/api/clients/' + state.editId, props.auth) as Promise<DetailedClient|ClientError>,

      fetchJsonAuth('/api/products/', props.auth) as Promise<Product[]>,
    ]
    const [ defaults, products ] = await Promise.all(promises)

    if (products) {
      this.setState({products})
    }

    if (defaults) {
      if (isClientError(defaults)) {
        const error = defaults.error
        console.log(error)
        if (error.code === 'not_found') {
          const msg = 'No se encontró el cliente que se buscaba'
                    + `, (Nota: id = ${state.editId}).`
          this.setState({error: msg})
        } else {
          this.setState({error: error.message})
        }
        return
      }
      if (state.mode === 'CREATE') {
        const createDefaults = defaults as ClientDefaults
        this.setState({code: createDefaults.code})
      } else {
        const editDefaults = defaults as DetailedClient
        this.setState({
          code: editDefaults.code,
          name: editDefaults.name,
          defaultCash: editDefaults.defaultCash ? 'true' : 'false',
          notes: editDefaults.notes || '',
          prices: editDefaults.Prices.map(pr =>
            Object.assign({}, pr, {value: String(pr.value)})
          ),
        })
      }

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

    if (name === 'name') {
      this.setState({errorEmptyName: false})
      if (this.state.errorDuplicatedField === 'name') {
        this.setState({errorDuplicatedField: null})
      }
    }

    if (name === 'code') {
      this.setState({errorEmptyCode: false})
      if (this.state.errorDuplicatedField === 'code') {
        this.setState({errorDuplicatedField: null})
      }
    }
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
      const product = products.find(p => p.id === price.productId) as Product

      this.setState({errorDuplicatedPrice: {
        priceName: price.name,
        productName: product.name,
      }})

      return
    }

    this.setState({
      prices: [...prevPrices, price]
    })
  }

  handleSubmit = async () => {
    const { props, state } = this
    let res = null

    if (state.name === '') {
      this.setState({errorEmptyName: true})
    }

    if (state.code === '') {
      this.setState({errorEmptyCode: true})
    }

    if (state.code === '' || state.name === '') return

    const body = JSON.stringify({
      name: state.name,
      code: state.code,
      defaultCash: state.defaultCash === 'true',
      notes: state.notes,
      prices: state.prices,
    })

    if (state.mode === 'CREATE') {
      res = await fetchJsonAuth('/api/clients/create', props.auth, {
        method: 'post',
        body,
      })
    } else {
      res = await fetchJsonAuth('/api/clients/' + state.editId, props.auth, {
        method: 'PATCH',
        body,
      })
    }

    if (!res.success) {
      if (res.error.code === 'validation_error') {
        const field = res.error.errors[0].path
        if (field === 'name' || field === 'code') {
          this.setState({errorDuplicatedField: field})
        }
        return
      }
      this.setState({errorSubmitting: true})
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

    if (state.products.length === 0) {
      return <LoadingScreen text='Cargando productos...' />
    }

    if (state.done) {
      return <Redirect to='/clients' push />
    }

    const { classes } = props

    const getProductName = (id: number) => {
      const product = state.products.find(p => p.id === id)
      if (product) {
        return product.name
      }
      return 'Producto con id ' + id
    }

    const displayName = {
      name: 'nombre',
      code: 'código'
    }

    const getFieldDesc = (field: 'name' | 'code') =>
      `${displayName[field]} ${state[field]}`

    return (
      <Layout>
        <DuplicatedPriceDialog
          priceError={state.errorDuplicatedPrice}
          onClose={() => this.setState({errorDuplicatedPrice: null})}
        />
        {state.error ?
          <Alert
            type='error'
            message={state.error}
          /> :

          <ResponsiveContainer variant='normal'>
            <Paper className={classes.paper}>
              <Title {...props}>
                {state.mode === 'CREATE' ?
                  'Crear Nuevo Cliente' :
                  `Editando Cliente ${state.name}`
                }
              </Title>
              {state.errorSubmitting &&
                <Alert
                  type='error'
                  message={
                    'Error ' +
                    (state.mode === 'CREATE' ? 'creando' : 'actualizando') +
                    ' el cliente favor intentarlo nuevamente'
                  }
                />
              }
              {state.errorDuplicatedField &&
                <Alert
                  type='error'
                  message={
                    'Error: El ' + getFieldDesc(state.errorDuplicatedField) +
                    ' ya existe.'
                  }
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
                  error={state.errorEmptyCode}
                  helperText={state.errorEmptyCode ? 'Especifique un código' : null}
                />
                <TextField
                  id='name'
                  label='Nombre'
                  margin='normal'
                  fullWidth
                  value={state.name}
                  onChange={this.handleChange('name')}
                  error={state.errorEmptyName}
                  helperText={state.errorEmptyName ? 'Especifique un nombre' : null}
                />
                <TextField
                  id='notes'
                  label='Informacion de Contacto'
                  margin='normal'
                  fullWidth
                  multiline
                  rows={3}
                  variant='outlined'
                  value={state.notes}
                  onChange={this.handleChange('notes')}
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
                    {getProductName(pr.productId)} a {money(Number(pr.value))}
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
                onClick={this.handleSubmit}
              >
                {state.mode === 'CREATE' ?
                  'Crear Cliente' :
                  'Actualizar Cliente'
                }
              </Button>
            </Paper>
          </ResponsiveContainer>
        }
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

export default adminOnly(withStyles(styles)(ClientEditor))
