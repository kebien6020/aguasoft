import { useNavigate, useParams } from 'react-router'
import Layout from '../../components/Layout'
import adminOnly from '../../hoc/adminOnly'
import Form from '../../components/form/Form'
import { Price, Product } from '../../models'
import TextField from '../../components/form/TextField'
import PricePicker from '../client-editor/components/PricePicker'
import { useProducts } from '../../hooks/api/useProducts'
import {
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  IconButtonProps,
  Paper,
  PaperProps,
  Typography,
} from '@mui/material'
import { useFormikContext } from 'formik'
import { fetchJsonAuth, isErrorResponse, money } from '../../utils'
import { Delete } from '@mui/icons-material'
import Yup from '../../components/form/Yup'
import SubmitButton from '../../components/form/SubmitButton'
import useSnackbar from '../../hooks/useSnackbar'
import useAuth from '../../hooks/useAuth'
import { useEffect } from 'react'
import Auth from '../../Auth'
import { VSpace } from '../../components/utils'

const MODE_CREATE = 0
const MODE_EDIT = 1
type Mode = typeof MODE_CREATE | typeof MODE_EDIT
type IncompletePrice = Pick<Price, 'name' | 'productId' | 'value'>

const initialValues = {
  name: '',
  prices: [] as IncompletePrice[],
}
type Values = typeof initialValues

const validationSchema = Yup.object().shape({
  name: Yup.string().required('El nombre es obligatorio'),
  prices: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('El nombre es obligatorio'),
      productId: Yup.number().required('El producto es obligatorio'),
      value: Yup.number().min(0, 'El valor debe ser mayor o igual a 0').required('El valor es obligatorio'),
    }),
  ).min(1, 'Debe agregar al menos un precio')
    .test('unique', 'No deben haber 2 precios con el mismo nombre y producto', (prices) => {
      if (!prices) return true
      const seen = new Set<string>()
      for (const price of prices) {
        const key = `${price.name}-${price.productId}`
        if (seen.has(key))
          return false

        seen.add(key)
      }
      return true
    }),
})

const PriceSetEditor = () => {
  const id = useUrlId()
  const mode = id === undefined ? MODE_CREATE : MODE_EDIT
  const editingStr = mode === MODE_EDIT ? 'Editando' : 'Creando'

  const showError = useSnackbar()
  const auth = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values: Values) => {
    const payload = {
      name: values.name,
      prices: values.prices,
    }

    const url = mode === MODE_CREATE ? '/api/price-sets' : `/api/price-sets/${id}`
    const res = await fetchJsonAuth(url, auth, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (isErrorResponse(res)) {
      showError(`Error al crear el conjunto de precios: ${res.error.message}`)
      return
    }

    navigate('/prices')
  }

  return (
    <Layout title={`${editingStr} Conjunto de Precios`}>
      <VSpace />
      <VSpace />
      <Form
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnMount
      >
        <EditorForm mode={mode} id={id} />
      </Form>
    </Layout>
  )
}
export default adminOnly(PriceSetEditor)

const useUrlId = () => {
  const { id } = useParams<{ id: string }>()
  return id
}

interface EditorFormProps {
  mode: Mode
  id?: string
}

interface PriceSetDetailResponse {
  id: number
  name: string
  prices: Price[]
}

const fetchPriceSetDetail = (id: string, auth: Auth) => {
  const url = `/api/price-sets/${id}?include[]=prices`
  return fetchJsonAuth<PriceSetDetailResponse>(url, auth)
}

const EditorForm = ({ mode, id }: EditorFormProps) => {
  const [products] = useProducts()
  const { setFieldValue } = useFormikContext<Values>()
  const auth = useAuth()
  const showError = useSnackbar()

  // Reload data when editing
  useEffect(() => {
    (async () => {
      if (mode !== MODE_EDIT || !id) return

      const res = await fetchPriceSetDetail(id, auth)
      if (isErrorResponse(res)) {
        showError(`Error al cargar el conjunto de precios: ${res.error.message}`)
        return
      }

      setFieldValue('name', res.name, true)
      setFieldValue('prices', res.prices.map(pr => ({
        name: pr.name,
        productId: pr.productId,
        value: pr.value,
      })), true)

    })()
  }, [mode, id, auth, setFieldValue, showError])

  if (products === null)
    return <CircularProgress />


  return <EditorFormImpl mode={mode} id={id} products={products} />
}

interface EditorFormImplProps extends EditorFormProps {
  products: Product[]
}

const EditorFormImpl = ({ mode, products }: EditorFormImplProps) => {
  const { setFieldValue, values } = useFormikContext<Values>()
  const { prices } = values

  const handleAddPrice = (price: IncompletePrice) => {
    setFieldValue('prices', [...prices, price])
  }

  const handleDeletePrice = (index: number) => {
    const newPrices = prices.filter((_, idx) => idx !== index)
    setFieldValue('prices', newPrices)
  }

  return (
    <>
      <TextField name="name" label="Nombre del conjunto de precios" fullWidth />
      <PriceList prices={prices} products={products} onDeletePrice={handleDeletePrice} />
      <Grid size={12}>
        <PricePicker products={products} clientName='' onNewPrice={handleAddPrice} />
      </Grid>
      <Grid size={12}>
        <SubmitButton onlyEnableWhenValid>
          {mode === MODE_CREATE ? 'Crear Conjunto de Precios' : 'Guardar Cambios'}
        </SubmitButton>
      </Grid>
    </>
  )
}

interface PriceListProps {
  prices: IncompletePrice[]
  products: Product[]
  onDeletePrice?: (index: number) => void
}

const PriceList = ({ prices, products, onDeletePrice: onPriceDelete }: PriceListProps) => {
  const { errors, touched } = useFormikContext<Values>()
  const { prices: pricesErrors } = errors
  const { prices: pricesTouched } = touched

  return (
    <Grid size={12}>
      {prices.map((pr, idx) => (
        <PricePaper key={idx}>
          {pr.name !== 'Base' && <>
            <Typography variant='subtitle2'>{pr.name}</Typography>
            <Divider />
          </>}
          <Typography variant='body1'>
            {getProductName(pr.productId, products)} a {money(pr.value)}
          </Typography>
          <DeleteIconButton
            onClick={() => {
              onPriceDelete?.(idx)
            }}
            size="large">
            <Delete />
          </DeleteIconButton>
        </PricePaper>
      ))}
      {typeof pricesErrors === 'string' && pricesTouched && (
        <Typography color="error">{pricesErrors}</Typography>
      )}
    </Grid>
  )
}

const PricePaper = (props: PaperProps) => (
  <Paper sx={theme => ({
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    position: 'relative',
  })} {...props} />
)

const DeleteIconButton = (props: IconButtonProps) => (
  <IconButton
    sx={theme => ({
      color: 'red',
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: theme.spacing(4),
    })} {...props} />
)

const getProductName = (id: number, products: Product[]) => {
  const product = products.find(p => p.id === id)
  if (product)
    return product.name

  return `Producto con id ${id}`
}
