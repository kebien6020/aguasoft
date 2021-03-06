import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import useSnackbar from '../hooks/useSnackbar'
import Layout from '../components/Layout'
import { fetchJsonAuth, money, isErrorResponse, NotEnoughInSourceError } from '../utils'
import { AuthRouteComponentProps } from '../AuthRoute'
import { Client } from '../models'

const styles: StyleRulesCallback<Theme, RegisterSaleProps> = theme => ({
  title: {
    textAlign: 'center',
    paddingTop: theme.spacing(2),
  },
  paper: {
    minHeight: '80vh',
    width: '90%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.down('sm')]: {
      width: '98%',
    },
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  qtyCell: {
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      '& button': {
        minWidth: '24px',
      },
      '& span': {
        width: undefined,
      },
    },
  },
  numericInput: {
    width: theme.spacing(6),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width: theme.spacing(3),
      marginRight: 0,
      fontSize: '1em',
    },
    '& input': {
      textAlign: 'center',
      '-moz-appearance': 'textfield',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
      },
    },
  },
  credit: {
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
  button: {
    color: 'white',
  },
})

interface SqIconButtonProps {
  children: JSX.Element
  onClick: () => unknown
}
const SqIconButton = ({ children, onClick }: SqIconButtonProps) => (
  <Button
    disableRipple
    onClick={onClick}
    size='small'
    variant='contained'
    color='secondary'
  >
    {children}
  </Button>
)

interface PlusButtonProps { onClick: () => unknown }
const PlusButton = (props: PlusButtonProps) => (
  <SqIconButton onClick={props.onClick}><AddIcon /></SqIconButton>
)

interface MinusButtonProps { onClick: () => unknown }
const MinusButton = (props: MinusButtonProps) => (
  <SqIconButton onClick={props.onClick}><RemoveIcon /></SqIconButton>
)
const handleNumericFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  const inputElement = event.target
  inputElement.select()
}

interface NumericPickerProps extends PropClasses {
  value: number
  onChange: (val: number) => unknown
}
const NumericPicker = (props: NumericPickerProps) => (
  <React.Fragment>
    <Input
      type='number'
      value={props.value}
      className={props.classes.numericInput}
      onFocus={handleNumericFocus}
      onChange={(event) => props.onChange(Number(event.target.value) || 0)}
    />
    <PlusButton onClick={() => props.onChange(props.value + 1)} />
    <MinusButton onClick={() => props.onChange(props.value - 1)}/>
  </React.Fragment>
)

interface RegisterSaleProps extends PropClasses, AuthRouteComponentProps<unknown>, WithSnackbarProps {

}

interface User {
  id: number
  code:string
  name: string
}

interface SimplePrice {
  value: number
  name: string
}

interface Product {
  id: number
  code: string
  name: string
  basePrice: string
}

interface DetailedProduct extends Product {
  qty: number
  prices: SimplePrice[]
  selectedPrice: SimplePrice
}

interface Price {
  id: number
  clientId: number
  productId: number
  value: number
  name: string
}

interface RegisterSaleState {
  clientId: number | null
  clients: Client[] | null
  user: User | null
  products: DetailedProduct[] | null
  disableButton: boolean
  cash: boolean
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

interface WithSnackbarProps {
  showMessage: ReturnType<typeof useSnackbar>
}

function withSnackbar<T>(
  Component: React.ComponentType<T>
) {

  const Wrapped = (props: T & Partial<WithSnackbarProps>) => {
    const showMessage = useSnackbar()

    return <Component showMessage={showMessage} {...props} />
  }

  const displayName =
    Component.displayName || Component.name || 'Component'

  Wrapped.displayName = `withSnackbar(${displayName})`

  return Wrapped
}

class RegisterSale extends React.Component<RegisterSaleProps, RegisterSaleState> {

  constructor(props: RegisterSaleProps) {
    super(props)

    this.state = {
      clientId: null,
      clients: null,
      user: null,
      products: null,
      disableButton: false,
      cash: false,
    }
  }

  getCustomPrices(id: number, customPrices: Price[]) {
    const prices = customPrices.filter((cp) => cp.productId === id)
    if (prices.length > 0)
      return prices
    return undefined
  }

  async componentDidMount() {
    // TODO: Error handling
    const auth = this.props.auth
    let clients = await fetchJsonAuth<Client[]>('/api/clients', auth)
    if (isErrorResponse(clients)) {
      console.error(clients)
      return
    }
    clients = clients.filter(cl => !cl.hidden)
    this.setState({ clients, clientId: clients[0].id, cash: clients[0].defaultCash })

    const customPrices = await fetchJsonAuth<Price[]>(`/api/prices/${clients[0].id}`, auth)
    if (isErrorResponse(customPrices)) {
      console.error(customPrices)
      return
    }

    const products = await fetchJsonAuth<Product[]>('/api/products', auth)
    if (isErrorResponse(products)) {
      console.error(products)
      return
    }
    const detailedProducts: DetailedProduct[] = products.map(p => {
      const prices =
           this.getCustomPrices(p.id, customPrices)
        || [{ value: Number(p.basePrice), name: 'Base' }]
      
      return {
        ...p,
        qty: 0,
        prices,
        selectedPrice: prices[0],
      }
    })
    this.setState({ products: detailedProducts })

    const user = await fetchJsonAuth<User>('/api/users/getCurrent', auth)
    if (isErrorResponse(user)) {
      console.error(user)
      return
    }

    if (user) 
      this.setState({ user })
    

  }

  submit = async () => {
    const { state, props } = this
    const auth = props.auth

    const date = new Date()

    if (!state.products) return

    const sells = state.products.map(product => ({
      date,
      clientId: state.clientId,
      productId: product.id,
      quantity: product.qty,
      value: Math.round(product.selectedPrice.value * product.qty),
      priceOverride: product.selectedPrice.value,
      cash: state.cash,
    })).filter(sell => sell.quantity !== 0)

    this.setState({ disableButton: true })

    const res = await fetchJsonAuth('/api/sells/bulkNew', auth, {
      method: 'post',
      body: JSON.stringify({ sells }),
    })

    this.setState({ disableButton: false })

    if (isErrorResponse(res)) {
      const msg = (() => {
        if (res.error.code === 'not_enough_in_source') {
          const error = res.error as NotEnoughInSourceError

          const storageName = error.storageName || 'Desconocido'
          const elementName = error.inventoryElementName || 'Desconocido'

          return `No hay suficiente cantidad del elemento ${elementName} en el almacen ${storageName}`
        }

        return res.error.message
      })()

      props.showMessage('Error al guardar la venta: ' + msg)
      return
    }

    // After submitting go back to the dashboard
    this.props.history.push('/')
  }

  handleClientChange = async (event: InputEvent) => {

    if (!this.state.products) return

    const { auth } = this.props
    const clientId = event.target.value === 'none'
      ? null
      : Number(event.target.value)

    if (!clientId) {
      console.error('No client selected')
      return
    }

    const customPrices = await fetchJsonAuth<Price[]>(`/api/prices/${clientId}`, auth)
    if (isErrorResponse(customPrices)) {
      console.error(customPrices)
      return
    }

    const currentProducts = this.state.products
    const updatedProducts: DetailedProduct[] = currentProducts.map(p => {
      const prices = this.getCustomPrices(p.id, customPrices)
                     || [{ value: Number(p.basePrice), name: 'Base' }]
      return {
        ...p,
        prices,
        selectedPrice: prices[0],
      }
    })

    const client = this.state.clients ? this.state.clients.find(c => c.id === clientId) : null
    const clientDefaultCash = client ? client.defaultCash : false

    this.setState({
      products: updatedProducts,
      cash: clientDefaultCash,
      clientId,
    })
  }

  handleProductQtyChange = (productId: number, qty: number) => {
    if (qty < 0) return

    const { state } = this

    if (!state.products) return

    const products = state.products
    const product = products.find(p => p.id === productId)
    if (product) 
      product.qty = qty
    

    this.setState({ products })
  }

  handleDefaultCashChange = (_event: unknown, checked: boolean) => {
    this.setState({ cash: !checked })
  }

  handlePriceChange = (productId: number, priceName: string) => {

    if (!this.state.products) return

    const modProducts = this.state.products.map(p => {
      const selectedPrice =
        p.prices.find(pr => pr.name === priceName) as SimplePrice
      if (p.id === productId) {
        return {
          ...p,
          selectedPrice,
        }
      } else {
        return p
      }
    })

    this.setState({ products: modProducts })
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <Layout title='Registrar Venta' container={React.Fragment}>
        <Paper elevation={8} className={classes.paper}>
          <Typography variant="h6" className={classes.title}>
            Registrar Venta
          </Typography>
          <Grid container>
            <Grid item xs={6}>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='input-user'>Usuario</InputLabel>
                <Input
                  disabled
                  value={state.user
                    ? `(${state.user.code}) ${state.user.name}`
                    : 'Cargando...'
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='input-client'>Cliente</InputLabel>
                <Select
                  id='input-client'
                  fullWidth
                  value={state.clientId || 'none'}
                  onChange={this.handleClientChange}
                >
                  {state.clients
                    ? state.clients.map((client, key) =>
                      <MenuItem key={key} value={client.id}>
                        ({client.code}) {client.name}
                      </MenuItem>
                    )
                    : <MenuItem value='none'>Cargando...</MenuItem>
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell className={classes.qtyCell}>Cantidad</TableCell>
                    <TableCell>Valor Unitario</TableCell>
                    <TableCell>Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!state.products
                    ? <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                        Cargando...
                      </TableCell>
                    </TableRow>
                    // Loaded products
                    : state.products.map((product, key) => (
                      <TableRow key={key}>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className={classes.qtyCell}>
                          <NumericPicker
                            classes={classes}
                            value={product.qty}
                            onChange={(qty)=> this.handleProductQtyChange(product.id, qty)}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <Select
                            id={`price-product-${product.id}`}
                            fullWidth
                            value={product.selectedPrice.name}
                            onChange={(event) =>
                              this.handlePriceChange(product.id, event.target.value as string)
                            }
                          >
                            {product.prices
                              ? product.prices.map((price, key) =>
                                <MenuItem key={key} value={price.name}>
                                  {price.name} | {money(price.value, 2)}
                                </MenuItem>
                              )
                              : <MenuItem value='none'>Cargando...</MenuItem>
                            }
                          </Select>
                        </TableCell>
                        <TableCell align='right'>{money(product.selectedPrice.value * product.qty)}</TableCell>
                      </TableRow>
                    ))
                  }
                  {state.products
                    // Total row
                    && <TableRow>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>
                        {money(state.products.reduce((acc, prod) => acc + prod.selectedPrice.value * prod.qty, 0))}
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} className={classes.credit}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!state.cash}
                    onChange={this.handleDefaultCashChange}
                    value="credit"
                    color="primary"
                  />
                }
                label="Pago post-fechado"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                size='large'
                variant='contained'
                color='primary'
                fullWidth
                className={classes.button}
                onClick={this.submit}
                disabled={state.disableButton}
              >
                Registrar Venta
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Layout>
    )
  }
}

export default withStyles(styles)(withSnackbar(RegisterSale))
