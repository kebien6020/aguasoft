import { memo, useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Add, AddOutlined, CloseOutlined } from '@mui/icons-material'
import { useFormikContext } from 'formik'

import Layout from '../../components/Layout'
import Title from '../../components/Title'
import useUser, { useUserFetch } from '../../hooks/useUser'
import Form from '../../components/form/Form'
import { useClient, useClientOptions } from '../../hooks/api/useClients'
import SelectField from '../../components/form/SelectField'
import { DateField } from '../../components/form/DateField'
import { VSpace } from '../../components/utils'
import { optionsFromProducts, optionsFromVariants, useProducts } from '../../hooks/api/useProducts'
import SubmitButton from '../../components/form/SubmitButton'
import { Batch, Price, Product, ProductWithBatchCategory, User } from '../../models'
import { NumericField } from '../../components/form/NumericField'
import { optionsFromBatches, useBatches } from '../../hooks/api/useBatches'
import { optionsFromPrices, usePrices } from '../../hooks/api/usePrices'
import yup from '../../components/form/Yup'
import { ErrorResponse, fetchJsonAuth, isErrorResponse, money } from '../../utils'
import { useBatchCategory } from '../../hooks/api/useBatchCategories'
import { formatDateonly } from '../../utils'
import useAuth from '../../hooks/useAuth'
import useSnackbar from '../../hooks/useSnackbar'
import { HiddenField } from '../../components/form/HiddenField'
import { fetchPrices } from '../../api/prices'
import { FetchError } from '../../api/common'
import { MakeRequired } from '../../utils/types'
import { SaleForCreate, createSales } from '../../api/sales'
import { useNavigate } from 'react-router'
import { startOfDay } from 'date-fns'
import { formatDateonlyMachine } from '../../utils/dates'

type SaleLine = {
  productId: string | undefined
  variantId: string | undefined
  quantity: number
  batch: string | undefined
  priceId: string | undefined
}

const initialValues = {
  client: '',
  cash: 'true',
  date: startOfDay(new Date),
  saleLines: [] as SaleLine[],
}

const validationSchema = yup.object().shape({
  client: yup.string().required(),
  cash: yup.string().required().oneOf(['true', 'false']),
  date: yup.date().notRequired(),
  saleLines: yup.array().of(yup.object().shape({
    productId: yup.string().required(),
    variantId: yup.string().nullable(),
    quantity: yup.number().required().min(1, 'La cantidad debe ser mayor a 0'),
    batch: yup.string().required(),
    priceId: yup.string().required(),
  })).min(1, 'Debe agregar al menos un producto'),
})

type Values = typeof initialValues

type ValidatedSaleLine = MakeRequired<SaleLine, 'productId' | 'quantity' | 'priceId'>

interface MapToCreateSaleDeps {
  prices: Record<string, Price>
  cash: boolean
  clientId: number
  isAdmin: boolean
  date: Date | undefined
}

const mapToCreateSale = (deps: MapToCreateSaleDeps) => (line: ValidatedSaleLine): SaleForCreate => {
  const price = deps.prices[line.priceId]
  if (!price)
    throw new Error(`Precio para el producto ${line.productId} no encontrado para este cliente`)

  const priceValue = Number(price.value)
  const date = deps.date ? formatDateonlyMachine(deps.date) : undefined

  return {
    ...(deps.isAdmin && date ? { date } : {}),
    cash: deps.cash,
    clientId: deps.clientId,
    priceOverride: priceValue,
    quantity: line.quantity,
    productId: Number(line.productId),
    variantId: line.variantId === '' ? undefined : Number(line.variantId),
    batchId: line.batch === '' || line.batch === 'NOT_APPLICABLE' ? undefined : Number(line.batch),
    value: priceValue * line.quantity,
  }
}

const RegisterSale = memo(() => {
  const auth = useAuth()
  const showMsg = useSnackbar()
  const navigate = useNavigate()
  const user = useUser()

  const isAdmin = user?.isAdmin ?? false

  const handleSubmit = useCallback(async (values: Values) => {
    console.log({ values })
    if (isNaN(Number(values.client))) {
      showMsg('Error en la aplicación: id de cliente no es un número valido')
      return
    }

    const clientId = Number(values.client)
    const saleLines = values.saleLines as ValidatedSaleLine[]

    let prices: Price[]
    try {
      prices = await fetchPrices(clientId, auth)
    } catch (e: unknown) {
      if (e instanceof FetchError) {
        showMsg(`Error al cargar los precios: ${e.message}`)
        return
      }

      showMsg('Error desconocido al cargar los precios')
      return
    }

    const priceMap = prices.reduce((o, p) => {
      o[p.id] = p
      return o
    }, {} as Record<string, Price>)

    const deps = {
      prices: priceMap,
      cash: values.cash === 'true',
      date: values.date,
      clientId,
      isAdmin,
    }

    let sales: SaleForCreate[]
    try {
      sales = saleLines.map(mapToCreateSale(deps))
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMsg(`Error al crear la venta: ${e.message}`)
        return
      }
      showMsg('Error al crear la venta')
      return
    }

    try {
      await createSales(sales, auth)
    } catch (e) {
      if (e instanceof FetchError) {
        showMsg(`Error al crear la venta: ${e.message}`)
        return
      }
      showMsg('Error al crear la venta')
      return
    }

    navigate('/sells')

  }, [auth, showMsg, navigate])


  return (
    <Layout title='Register Sale'>
      <Title>Registrar Venta</Title>
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        validateOnMount
      >
        <RegisterSaleImpl />
      </Form>
    </Layout>
  )
})
RegisterSale.displayName = 'RegisterSale'

export default RegisterSale

const cashOptions = [
  { value: 'true', label: 'Efectivo' },
  { value: 'false', label: 'Posfechado' },
]

const RegisterSaleImpl = memo(() => {
  const user = useUser()
  const isAdmin = user?.isAdmin ?? false
  const [clients] = useClientOptions()
  const auth = useAuth()

  const { values, setFieldValue } = useFormikContext<Values>()

  const clientId = isNaN(Number(values.client)) || Number(values.client) === 0 ? null : Number(values.client)
  const [client] = useClient(clientId)
  const navigate = useNavigate()

  useEffect(() => {

    if (user?.loggedIn === null || user?.loggedIn === undefined) return
    if (!user.loggedIn) {
      // In case of not logged in, double check with an actual request
      // as the user might be out of date in the context
      (async () => {
        const url = '/api/users/getCurrent'
        const user: ErrorResponse | User = await fetchJsonAuth(url, auth)

        if (isErrorResponse(user))
          navigate('/check?next=/sell')

      })()
    }

  }, [user?.loggedIn, navigate])

  useEffect(() => {
    if (client?.defaultCash === undefined)
      return

    setFieldValue('cash', client.defaultCash ? 'true' : 'false')
  }, [client?.defaultCash, setFieldValue])

  const handleAdd = useCallback(() => {
    setFieldValue('saleLines', [
      ...values.saleLines, {
        productId: '',
        variantId: '',
        quantity: 1,
        batch: '',
        priceId: '',
      },
    ])
  }, [setFieldValue, values.saleLines])

  const handleRemove = useCallback((idx: number) => {
    const newLines = values.saleLines.filter((_, i) => i !== idx)
    setFieldValue('saleLines', newLines)
  }, [setFieldValue, values.saleLines])

  // Auto add a line when a client is selected
  useEffect(() => {
    if (clientId === null || values.saleLines.length !== 0)
      return

    handleAdd()
  }, [clientId, handleAdd, values.saleLines.length])

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <StyledPaper>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SelectField name='client' label='Cliente' options={clients} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {client && (
                <SelectField name='cash' label='Tipo de Venta' options={cashOptions} />
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              {isAdmin && (
                <DateField name='date' label='Fecha de la Venta' />
              )}
            </Grid>
          </Grid>
        </StyledPaper>
      </Grid>
      <VSpace />
      <Grid size={{ xs: 12 }}>
        <SaleLineForms
          onRemove={handleRemove}
          clientId={Number(values.client)}
        />
        <StyledPaper>
          <Button
            disabled={values.client === ''}
            variant='contained'
            color='secondary'
            fullWidth
            onClick={handleAdd}
          >
            <AddOutlined /> Agregar Producto
          </Button>
        </StyledPaper>
      </Grid>
      <VSpace />
      <Grid size={{ xs: 12 }}>
        <StyledPaper>
          <TotalPrice />
          <SubmitButton onlyEnableWhenValid>
            Registrar Venta
          </SubmitButton>
        </StyledPaper>
      </Grid>
    </>
  )
})
RegisterSaleImpl.displayName = 'RegisterSaleImpl'

const TotalPrice = memo(() => {
  const { values } = useFormikContext<Values>()
  const clientId = values.client !== '' ? Number(values.client) : undefined

  if (!clientId)
    return null


  return <TotalPriceImpl clientId={clientId} />
})
TotalPrice.displayName = 'TotalPrice'

const TotalPriceImpl = memo(({ clientId }: { clientId: number }) => {
  const { values } = useFormikContext<Values>()
  const [prices] = usePrices(clientId)

  const total = useMemo(
    () => calcTotal(values.saleLines, prices),
    [values.saleLines, prices],
  )

  return (
    <>
      Valor total de la venta: {money(total)}
    </>
  )
})
TotalPriceImpl.displayName = 'TotalPriceImpl'

const calcTotal = (saleLines: SaleLine[], prices: Price[] | null) => {
  if (!prices)
    return 0


  const priceMap = prices.reduce((o, p) => {
    o[p.id] = p
    return o
  }, {} as Record<string, Price>)

  const total = saleLines.reduce((acc, line) => {
    if (!line.priceId) { // Skip lines when price hasn't been selected yet
      return acc
    }
    const price = priceMap[line.priceId]?.value
    if (!price || isNaN(Number(price)))
      return acc

    return acc + Number(price) * line.quantity
  }, 0)

  return total
}

interface SaleLineFormsProps {
  clientId: number
  onRemove: (idx: number) => void
}

const SaleLineForms = memo(({ onRemove, clientId }: SaleLineFormsProps) => {
  const [products] = useProducts({ params: { include: ['Variants'] } })
  const { values } = useFormikContext<Values>()
  const saleLines = values.saleLines

  return (
    <>
      {saleLines.map((line, idx) => (
        <Fragment key={idx}>
          <StyledPaper>
            <SaleLineForm idx={idx} onRemove={onRemove} line={line} products={products} clientId={clientId} />
          </StyledPaper>
          <VSpace />
        </Fragment>
      ))}
    </>
  )
})
SaleLineForms.displayName = 'SaleLineForms'

type SaleLineFormProps = {
  idx: number
  products: Product[] | null
  line: SaleLine
  clientId: number
  onRemove: (idx: number) => void
}

const SaleLineForm = memo(({ idx, products, line, onRemove, clientId }: SaleLineFormProps) => {
  const productOpts = useMemo(() => optionsFromProducts(products), [products])
  const product = useMemo(() => products?.find(p => p.id === Number(line.productId)), [products, line.productId])
  const variants = useMemo(() => product?.Variants ?? [], [product])
  const variantOpts = useMemo(() => optionsFromVariants(variants), [variants])
  const [prices] = usePrices(clientId, { params: { productId: line.productId } })
  const priceOpts = useMemo(() => optionsFromPrices(prices), [prices])
  const priceOptsFinal = useMemo(
    () => clientId && line.productId ? priceOpts : [],
    [clientId, line.productId, priceOpts])
  const emptyOption = clientId && line.productId ? undefined : 'Debe seleccionar el cliente y producto'
  const selectedPriceMaybe = line.priceId && prices && prices.find(p => p.id === Number(line.priceId))?.value
  const selectedPrice = selectedPriceMaybe ? Number(selectedPriceMaybe) : 0

  const { setFieldValue } = useFormikContext<Values>()

  // Auto-select the first price when available
  useEffect(() => {
    if (priceOptsFinal === null || priceOptsFinal.length === 0)
      return

    setFieldValue(`saleLines[${idx}].priceId`, priceOptsFinal[0].value)

  }, [priceOptsFinal, idx, setFieldValue])

  // Auto-select the first variant when available
  useEffect(() => {
    if (variantOpts === null || variantOpts.length === 0)
      return

    setFieldValue(`saleLines[${idx}].variantId`, variantOpts[0].value)

  }, [idx, setFieldValue, variantOpts])

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }} container justifyContent='flex-end'>
        <IconButton onClick={() => onRemove(idx)} size='small' style={{ margin: -8 }}>
          <CloseOutlined />
        </IconButton>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SelectField name={`saleLines[${idx}].productId`} label='Producto' options={productOpts} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {(variantOpts?.length ?? 0) > 0 && (
          <SelectField name={`saleLines[${idx}].variantId`} label='Variante' options={variantOpts} emptyOption='Ninguna' />
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <NumericField name={`saleLines[${idx}].quantity`} label='Cantidad' />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SelectField name={`saleLines[${idx}].priceId`} label='Precio' options={priceOptsFinal} emptyOption={emptyOption} />
      </Grid>
      <BatchFieldGrid size={{ xs: 12, md: 6 }}>
        {product?.batchCategoryId ? <>
          <BatchField idx={idx} product={product as ProductWithBatchCategory} />
        </> : null}
        {product && product.batchCategoryId === null ? <>
          <HiddenField name={`saleLines[${idx}].batch`} value='NON_APPLICABLE' />
        </> : null}
      </BatchFieldGrid>

      <Grid size={{ xs: 12 }}>
        <Hr />
      </Grid>

      <Grid size={{ xs: 12 }}>
        Precio Total: {money(line.quantity * selectedPrice)}
      </Grid>

    </Grid>
  )
})
SaleLineForm.displayName = 'SaleLineForm'

const BatchFieldGrid = styled(Grid)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
})

const Hr = styled(VSpace)(({ theme }) => ({
  borderBottomWidth: 2,
  borderBottomStyle: 'solid',
  borderBottomColor: theme.palette.divider,
  marginLeft: -theme.spacing(2),
  marginRight: -theme.spacing(2),
  width: `calc(100% + calc(${theme.spacing(2)} * 2))`,
}))

const BatchField = memo(({ idx, product }: { idx: number, product: ProductWithBatchCategory }) => {
  const [batches, update] = useBatches({ batchCategoryId: product.batchCategoryId })
  const options = optionsFromBatches(batches ?? null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const toggleAddDialog = useCallback(() => setAddDialogOpen(prev => !prev), [])
  const closeDialog = useCallback(() => setAddDialogOpen(false), [])

  const fieldName = `saleLines[${idx}].batch`

  const { setFieldValue } = useFormikContext<Values>()
  const handleBatchCreated = useCallback((batch: Batch) => {
    setFieldValue(fieldName, String(batch.id))
    update()
  }, [fieldName, setFieldValue, update])

  return (<>
    <SelectField name={fieldName} label='Lote' options={options} style={{ flex: 1 }} />
    <Tooltip title='Crear nuevo lote' placement='bottom'>
      <IconButton onClick={toggleAddDialog} size="large">
        <Add />
      </IconButton>
    </Tooltip>
    <AddBatchDialog
      product={product}
      open={addDialogOpen}
      onClose={closeDialog}
      onCreated={handleBatchCreated}
    />
  </>)
})
BatchField.displayName = 'BatchField'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}))

interface AddBatchDialogProps {
  product: ProductWithBatchCategory
  open: boolean
  onClose: () => void
  onCreated?: (batch: Batch) => void
}

const addBatchInitialValues = {
  date: new Date(),
}

const AddBatchDialog = memo(({ product, open, onClose, onCreated }: AddBatchDialogProps) => {
  const [category] = useBatchCategory(product.batchCategoryId)
  const loading = category === null
  const auth = useAuth()
  const showError = useSnackbar()

  const handleSubmit = useCallback(async (values: typeof addBatchInitialValues) => {
    const dateonly = formatDateonly(values.date)

    const body = {
      date: dateonly,
      batchCategoryId: product.batchCategoryId,
    }

    let res: Batch | ErrorResponse
    try {
      res = await fetchJsonAuth<Batch>('/api/batches', auth, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (e) {
      showError('Error de conexion al tratar de crear un nuevo lote')
      return
    }

    if (isErrorResponse(res)) {
      showError(`Error al tratar de crear un nuevo lote: ${res.error?.message ?? '???'}`)
      return
    }

    onCreated?.(res)
    onClose()

  }, [auth, onClose, onCreated, product.batchCategoryId, showError])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Crear nuevo Lote</DialogTitle>
      <DialogContent>
        <Form
          initialValues={addBatchInitialValues}
          onSubmit={handleSubmit}
        >
          <Grid size={{ xs: 12 }}>
            <DialogContentText>
              Creando un nuevo lote en la categoría: {category?.name ?? 'Cargando…'}
            </DialogContentText>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DateField name='date' label='Fecha del Lote' />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SubmitButton disabled={loading}>Crear Lote</SubmitButton>
          </Grid>
        </Form>

      </DialogContent>
    </Dialog>
  )
})
AddBatchDialog.displayName = 'AddBatchDialog'
