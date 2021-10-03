import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback, styled } from '@material-ui/core/styles'
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
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import useSnackbar from '../hooks/useSnackbar'
import Layout from '../components/Layout'
import { fetchJsonAuth, money, isErrorResponse, NotEnoughInSourceError } from '../utils'
import { MakeRequired } from '../utils/types'
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

interface NumericPickerProps {
  value: number
  onChange: (val: number) => unknown
}
const NumericPicker = (props: NumericPickerProps) => (
  <NoWrap>
    <NumericInput
      type='number'
      value={props.value}
      onFocus={handleNumericFocus}
      onChange={(event) => props.onChange(Number(event.target.value) || 0)}
    />
    <PlusButton onClick={() => props.onChange(props.value + 1)} />
    <MinusButton onClick={() => props.onChange(props.value - 1)}/>
  </NoWrap>
)

const NoWrap = styled('div')({
  display: 'flex',
  flexFlow: 'row nowrap',
})

const NumericInput = styled(Input)(({ theme }) => ({
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
}))

interface User {
  id: number
  code:string
  name: string
}

interface SimplePrice {
  id: number
  value: number
  name: string
}

interface ProductVariant {
  readonly id: number
  readonly productId: number
  readonly code: string
  readonly name: string
  readonly basePrice: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null

  // Possible inclussions
  readonly Product?: Product
}

interface Product {
  id: number
  code: string
  name: string
  basePrice: string

  Variants?: ProductVariant[]
}

type SaleProduct = MakeRequired<Product, 'Variants'>

interface Price {
  id: number
  clientId: number
  productId: number
  value: number
  name: string
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

interface SaleLineProps {
  product: SaleProduct
  variant: ProductVariant | undefined
  productQty: number
  selectedPrice: SimplePrice | undefined
  productPrices: SimplePrice[] | undefined
  onProductQtyChange: (id: number, variantId: number | undefined, qty: number) => unknown
  onPriceChange: (id: number, variantId: number | undefined, price: SimplePrice) => unknown
}

const SaleLine = (props: SaleLineProps) => {
  const {
    product,
    variant,
    productQty,
    productPrices,
    selectedPrice,
    onProductQtyChange,
    onPriceChange,
  } = props

  const handlePriceChange = (event: InputEvent) => {
    const priceId = Number(event.target.value)
    const price = productPrices?.find(p => p.id === priceId)
    if (!price) {
      console.warn(
        `Price id ${priceId} not found in list of prices`,
        productPrices
      )
      return
    }
    onPriceChange(
      product.id,
      variant?.id,
      price,
    )
  }

  return (
    <TableRow>
      <TableCell>{product.code}</TableCell>
      <TableCell>
        <div>{product.name}</div>
        {variant && <VariantName>{variant.name}</VariantName>}
      </TableCell>
      <QtyCell>
        <NumericPicker
          value={productQty}
          onChange={qty => onProductQtyChange(product.id, variant?.id, qty)}
        />
      </QtyCell>
      <TableCell align='right'>
        <Select
          id={`price-product-${product.id}`}
          fullWidth
          value={selectedPrice?.id ?? DEFAULT_PRICE_ID}
          onChange={handlePriceChange}
        >
          {productPrices?.map((price, key) =>
            <MenuItem key={key} value={price.id}>
              {price.name} | {money(price.value, 2)}
            </MenuItem>
          ) ?? <MenuItem value='none'>Cargando…</MenuItem>}
        </Select>
      </TableCell>
      <TableCell align='right'>
        {selectedPrice !== undefined
          ? money(selectedPrice.value * productQty)
          : 'Cargando…'
        }
      </TableCell>
    </TableRow>
  )
}

const VariantName = (props: TypographyProps) =>
  <Typography variant='caption' color='textSecondary' {...props} />

const QtyCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    '& button': {
      minWidth: '24px',
    },
    '& span': {
      width: undefined,
    },
  },
}))

interface TotalsRowProps {
  lineStates: SaleLineState[]
}

const TotalsRow = ({ lineStates } : TotalsRowProps) => {
  const total = lineStates.reduce((acc, l) => {
    const qty = l.productQty
    const price = l.selectedPrice.value
    return acc + qty * price
  }, 0)

  return (
    <TableRow>
      <TableCell colSpan={3}></TableCell>
      <TableCell>Total</TableCell>
      <TableCell>
        {money(total)}
      </TableCell>
    </TableRow>
  )
}

type SaleLineKey = ImList<number|undefined> // actual wanted type: [number, number|undefined]

interface SaleLineState {
  productQty: number
  selectedPrice: SimplePrice
}

const DEFAULT_PRICE_ID = -1

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

  productById(productId: number): Product|undefined {
    return this.state.products?.find(p => p.id === productId)
  }

  pricesForProduct(productId: number, variantId: number|undefined): SimplePrice[] {
    const customPrices = this.getCustomPrices(productId, this.state.customPrices ?? [])
    const getDefaultPrices = () => {
      const product = this.productById(productId)
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

    return customPrices ?? getDefaultPrices()
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

    this.setState({ products, customPrices })

    const tableState = products.reduce((tab, prod) => {
      if (prod.Variants.length === 0) {
        const key = ImList([prod.id, undefined])
        const productPrices = this.pricesForProduct(prod.id, undefined)
        const val = {
          productQty: 0,
          selectedPrice: productPrices?.[0],
        }

        return tab.set(key, val)
      }

      const newTab = prod.Variants.reduce((tab, variant) => {
        const key = ImList([prod.id, variant.id])
        const selectedPrice = this.pricesForProduct(prod.id, variant.id)
        const val = {
          productQty: 0,
          selectedPrice: selectedPrice?.[0],
        }
        return tab.set(key, val)
      }, tab)

      return newTab
    }, ImMap<SaleLineKey, SaleLineState>())

    this.setState({ tableState })

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

    const customPrices = await fetchJsonAuth<Price[]>(`/api/prices/${clientId}`, auth)
    if (isErrorResponse(customPrices)) {
      console.error(customPrices)
      return
    }

    const currentProducts = this.state.products
    const updatedProducts: SaleProduct[] = currentProducts.map(p => {
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

      const productPrices = this.pricesForProduct(product.id, variant?.id)
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

export default withStyles(styles)(withSnackbar(RegisterSale))
