import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Button from 'material-ui/Button'
import { FormControl, FormControlLabel } from 'material-ui/Form'
import Grid from 'material-ui/Grid'
// import IconButton from 'material-ui/IconButton'
import Input, { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import Paper from 'material-ui/Paper'
import Select from 'material-ui/Select'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import CheckBox from 'material-ui/CheckBox'
import Typography from 'material-ui/Typography'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import Layout from '../components/Layout'
import { fetchJsonAuth } from '../utils'
import { AuthRouteComponentProps } from '../AuthRoute'

const styles: StyleRulesCallback = (theme: Theme) => ({
  title: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 2,
  },
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    minHeight: '80vh',
    width: '90%',
    [theme.breakpoints.down('sm')]: {
      width: '98%',
    },
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  qtyCell: {
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      '& button': {
        minWidth: '24px',
      },
      '& span': {
        width: undefined,
      }
    }
  },
  numericInput: {
    width: theme.spacing.unit * 6,
    marginRight: theme.spacing.unit,
    [theme.breakpoints.down('md')]: {
      width: theme.spacing.unit * 3,
      marginRight: 0,
      fontSize: '1em',
    },
    '& input': {
      textAlign: 'center',
      '-moz-appearance': 'textfield',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        'margin': 0,
      },
    },
  },
  credit: {
    textAlign: 'center',
    marginTop: theme.spacing.unit * 4,
  },
  button: {
    color: 'white'
  },
})

interface SqIconButtonProps {
  children: JSX.Element
  onClick: () => any
}
const SqIconButton = ({ children, onClick }: SqIconButtonProps) => (
  <Button
    disableRipple
    onClick={onClick}
    size='small'
    variant='raised'
    color='secondary'
  >
    {children}
  </Button>
)

interface PlusButtonProps { onClick: () => any }
const PlusButton = (props: PlusButtonProps) => (
  <SqIconButton onClick={props.onClick}><AddIcon /></SqIconButton>
)

interface MinusButtonProps { onClick: () => any }
const MinusButton = (props: MinusButtonProps) => (
  <SqIconButton onClick={props.onClick}><RemoveIcon /></SqIconButton>
)
const handleNumericFocus = (event: React.FocusEvent<HTMLDivElement>) => {
  const inputElement = event.target as any as HTMLInputElement // Trust me this is fine
  inputElement.select()
}

interface NumericPickerProps extends PropClasses {
  value: number
  onChange: (val: number) => any
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
    <MinusButton onClick={() => props.onChange(props.value -  1)}/>
  </React.Fragment>
)

interface RegisterSaleProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface Client {
  id: number
  code:string
  name: string
  defaultCash: boolean
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
  clientId: number
  clients: Client[]
  user: User
  products: DetailedProduct[]
  disableButton: boolean
  cash: boolean
}

type InputEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>

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

  async componentWillMount() {
    const auth = this.props.auth
    const clients: Client[] = await fetchJsonAuth('/api/clients', auth)
    this.setState({clients, clientId: clients[0].id, cash: clients[0].defaultCash})

    const customPrices: Price[] = await fetchJsonAuth('/api/prices/' + clients[0].id, auth)

    const products: Product[] = await fetchJsonAuth('/api/products', auth)
    const detailedProducts: DetailedProduct[] = products.map(p => {
      const prices = this.getCustomPrices(p.id, customPrices)
                     || [{value: Number(p.basePrice), name: 'Base'}]
      return {
        ...p,
        qty: 0,
        prices,
        selectedPrice: prices[0],
      }
    })
    this.setState({products: detailedProducts})

    const user: User = await fetchJsonAuth('/api/users/getCurrent', auth)
    if (user) {
      this.setState({user})
    }

  }

  submit = async () => {
    const { state, props } = this
    const auth = props.auth
    this.setState({disableButton: true})

    const date = new Date()
    const sells = state.products.map(product => ({
      date,
      clientId: state.clientId,
      productId: product.id,
      quantity: product.qty,
      value: product.selectedPrice.value * product.qty,
      priceOverride: product.selectedPrice.value,
      cash: state.cash,
    })).filter(sell => sell.quantity !== 0)

    await fetchJsonAuth('/api/sells/bulkNew', auth, {
      method: 'post',
      body: JSON.stringify({sells})
    })

    // After submitting go back to the user selection screen
    this.props.history.push('/check')
  }

  handleClientChange = async (event: InputEvent) => {
    const { auth } = this.props
    const clientId = event.target.value === 'none' ?
      null :
      Number(event.target.value)

    const customPrices: Price[] = await fetchJsonAuth('/api/prices/' + clientId, auth)

    const currentProducts = this.state.products
    const updatedProducts: DetailedProduct[] = currentProducts.map(p => {
      const prices = this.getCustomPrices(p.id, customPrices)
                     || [{value: Number(p.basePrice), name: 'Base'}]
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
    const products = state.products
    const product = products.find(p => p.id === productId)
    if (product) {
      product.qty = qty
    }

    this.setState({products})
  }

  handleDefaultCashChange = (event: any, checked: boolean) => {
    this.setState({cash: !checked})
  }

  handlePriceChange = (productId: number, priceName: string) => {
    const modProducts = this.state.products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          selectedPrice: p.prices.find(pr => pr.name === priceName)
        }
      } else {
        return p
      }
    })

    this.setState({products: modProducts})
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <Layout>
        <Paper elevation={8} className={classes.paper}>
          <Typography variant="title" className={classes.title}>
            Registrar Venta
        </Typography>
          <Grid container>
            <Grid item xs={6}>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='input-user'>Usuario</InputLabel>
                <Input
                  disabled
                  value={state.user ?
                    `(${state.user.code}) ${state.user.name}` :
                    'Cargando...'
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
                  {!state.products ?
                    <TableRow>
                      <TableCell colSpan={5} style={{textAlign: 'center'}}>
                        Cargando...
                      </TableCell>
                    </TableRow> :
                    // Loaded products
                    state.products.map((product, key) => (
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
                        <TableCell numeric>
                          <Select
                            id={`price-product-${product.id}`}
                            fullWidth
                            value={product.selectedPrice.name}
                            onChange={(event) => this.handlePriceChange(product.id, event.target.value)}
                          >
                          {product.prices
                            ? product.prices.map((price, key) =>
                                <MenuItem key={key} value={price.name}>
                                  {price.name} | {Math.round(price.value*100)/100}
                                </MenuItem>
                              )
                            : <MenuItem value='none'>Cargando...</MenuItem>
                          }
                          </Select>
                        </TableCell>
                        <TableCell numeric>{Math.round(product.selectedPrice.value * product.qty)}</TableCell>
                      </TableRow>
                    ))
                  }
                  {state.products &&
                    // Total row
                    <TableRow>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>{Math.round(state.products.reduce((acc, prod) => acc + prod.selectedPrice.value * prod.qty, 0))}</TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} className={classes.credit}>
              <FormControlLabel
                control={
                  <CheckBox
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
                variant='raised'
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

export default withStyles(styles)(RegisterSale)
