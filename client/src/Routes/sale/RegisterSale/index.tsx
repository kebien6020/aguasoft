import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import { Map as ImMap, List as ImList } from 'immutable'

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

import Layout from '../../../components/Layout'
import { fetchJsonAuth, isErrorResponse, NotEnoughInSourceError } from '../../../utils'
import { AuthRouteComponentProps } from '../../../AuthRoute'
import { Client } from '../../../models'
import { SaleProduct, ProductVariant, SimplePrice, User, Price, Product } from './types/models'
import { WithSnackbarProps, withSnackbar } from './hoc/withSnackbar'
import { DEFAULT_PRICE_ID } from './enum'
import { SaleLine } from './components/SaleLine'
import { InputEvent, SaleLineKey, SaleLineState } from './types/util'
import { TotalsRow } from './components/TotalsRow'

type RegisterSaleProps =
  PropClasses &
  AuthRouteComponentProps<unknown> &
  WithSnackbarProps

interface RegisterSaleState {
  clientId: number | null
  clients: Client[] | null
  user: User | null
  products: SaleProduct[] | null
  customPrices: Price[] | undefined
  disableButton: boolean
  cash: boolean
  tableState: ImMap<SaleLineKey, SaleLineState>
}

class RegisterSale extends React.Component<RegisterSaleProps, RegisterSaleState> {

  constructor(props: RegisterSaleProps) {
    super(props)

    this.state = {
      clientId: null,
      clients: null,
      user: null,
      products: null,
      customPrices: undefined,
      tableState: ImMap<SaleLineKey, SaleLineState>(),
      disableButton: false,
      cash: false,
    }
  }

  getCustomPrices(productId: number, customPrices: Price[]) {
    const prices = customPrices.filter((cp) => cp.productId === productId)
    if (prices.length > 0)
      return prices
    return undefined
  }

  productById(productId: number, products: SaleProduct[]|null): Product|undefined {
    return products?.find(p => p.id === productId)
  }

  pricesForProduct(
    productId: number,
    variantId: number|undefined,
    customPrices: Price[],
    products: SaleProduct[]|null
  ): SimplePrice[] {
    const customPricesProduct = this.getCustomPrices(productId, customPrices)
    const getDefaultPrices = () => {
      const product = this.productById(productId, products)
      if (!product) {
        console.error(`Product with id ${productId} not found in the list`)
        return []
      }

      const variant = product.Variants?.find(v => v.id === variantId)
      const value = variant && variant.basePrice
        ? Number(variant.basePrice)
        : Number(product.basePrice)

      return [
        {
          id: DEFAULT_PRICE_ID,
          value,
          name: 'Base',
        },
      ]
    }

    return customPricesProduct ?? getDefaultPrices()
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

    const products = await fetchJsonAuth<SaleProduct[]>('/api/products?include[]=Variants', auth)
    if (isErrorResponse(products)) {
      console.error(products)
      return
    }

    const tableState = this.newTableState(products, customPrices)

    this.setState({ products, customPrices, tableState })

    const user = await fetchJsonAuth<User>('/api/users/getCurrent', auth)
    if (isErrorResponse(user)) {
      console.error(user)
      return
    }

    if (user)
      this.setState({ user })
  }

  newTableState(products: SaleProduct[], customPrices: Price[]) {
    const oldTable = this.state.tableState ?? ImMap<SaleLineKey, SaleLineState>()

    const tableState = products.reduce((tab, prod) => {
      if (prod.Variants.length === 0) {
        const key = ImList([prod.id, undefined])
        const productPrices = this.pricesForProduct(prod.id, undefined, customPrices, products)
        const val = {
          productQty: oldTable.get(key)?.productQty ?? 0,
          selectedPrice: productPrices?.[0],
        }

        return tab.set(key, val)
      }

      const newTab = prod.Variants.reduce((tab, variant) => {
        const key = ImList([prod.id, variant.id])
        const selectedPrice = this.pricesForProduct(prod.id, variant.id, customPrices, products)
        const val = {
          productQty: oldTable.get(key)?.productQty ?? 0,
          selectedPrice: selectedPrice?.[0],
        }
        return tab.set(key, val)
      }, tab)

      return newTab
    }, ImMap<SaleLineKey, SaleLineState>())

    return tableState
  }

  submit = async () => {
    const { state, props } = this
    const auth = props.auth

    const date = new Date()

    if (!state.products) return

    const sells = [...state.tableState.entries()].map(([key, saleLine]) => ({
      date,
      clientId: state.clientId,
      productId: key.get(0),
      variantId: key.get(1),
      quantity: saleLine.productQty,
      value: Math.round(saleLine.selectedPrice.value * saleLine.productQty),
      priceOverride: saleLine.selectedPrice.value,
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

    this.setState({ disableButton: true })

    try {
      const customPrices = await fetchJsonAuth<Price[]>(`/api/prices/${clientId}`, auth)
      if (isErrorResponse(customPrices)) {
        console.error(customPrices)
        return
      }

      const client = this.state.clients ? this.state.clients.find(c => c.id === clientId) : null
      const clientDefaultCash = client ? client.defaultCash : false
      const tableState = this.newTableState(this.state.products, customPrices)

      this.setState({
        cash: clientDefaultCash,
        clientId,
        customPrices,
        tableState,
      })
    } finally {
      this.setState({ disableButton: false })
    }

  }

  handleProductQtyChange = (productId: number, variantId: number|undefined, qty: number) => {
    if (qty < 0) return

    if (!this.state.tableState) return

    const key = ImList([productId, variantId])
    const lineState = this.state.tableState.get(key)

    if (!lineState) return

    const newTableState = this.state.tableState.set(key, {
      ...lineState,
      productQty: qty,
    })

    this.setState({ tableState: newTableState })
  }

  handleDefaultCashChange = (_event: unknown, checked: boolean) => {
    this.setState({ cash: !checked })
  }

  handlePriceChange = (productId: number, variantId: number|undefined, price: SimplePrice) => {

    if (!this.state.tableState) return

    const key = ImList([productId, variantId])
    const lineState = this.state.tableState.get(key)

    if (!lineState) return

    const newTableState = this.state.tableState.set(key, {
      ...lineState,
      selectedPrice: price,
    })

    this.setState({ tableState: newTableState })
  }

  renderSaleLines = (product: SaleProduct): React.ReactNode => {
    const variants: (ProductVariant|undefined)[] = product.Variants.length === 0
      ? [undefined]
      : product.Variants

    return variants.map(variant => {
      const variantId = variant?.id ?? -1
      const key = ImList([product.id, variant?.id])
      const saleLine = this.state.tableState.get(key)
      if (!saleLine)
        return null

      const productPrices = this.pricesForProduct(
        product.id,
        variant?.id,
        this.state.customPrices ?? [],
        this.state.products,
      )
      const selectedPrice = saleLine.selectedPrice

      return (
        <SaleLine
          key={`${product.id}-${variantId}`}
          product={product}
          variant={variant}
          productQty={saleLine.productQty}
          productPrices={productPrices}
          selectedPrice={selectedPrice}
          onProductQtyChange={this.handleProductQtyChange}
          onPriceChange={this.handlePriceChange}
        />
      )
    })
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
                  {state.products?.map(this.renderSaleLines) ?? (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                          Cargando…
                      </TableCell>
                    </TableRow>
                  )}
                  {state.products && (
                    <TotalsRow lineStates={[...state.tableState.values()]}/>
                  )}
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
  credit: {
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
  button: {
    color: 'white',
  },
})

export default withStyles(styles)(withSnackbar(RegisterSale))
