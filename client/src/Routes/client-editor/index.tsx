import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

import DeleteIcon from '@mui/icons-material/Delete'

import LoadingScreen from '../../components/LoadingScreen'
import { fetchJsonAuth, money, isErrorResponse, SuccessResponse, ErrorResponse } from '../../utils'
import Layout from '../../components/Layout'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import Title from '../../components/Title'
import PricePicker, { IncompletePrice } from './components/PricePicker'
import { Client, Price, Product } from '../../models'
import Alert from '../../components/Alert'
import adminOnly from '../../hoc/adminOnly'
import useAuth from '../../hooks/useAuth'
import { useParams } from 'react-router'
import { PriceError } from './types'
import { DuplicatedPriceDialog } from './components/DuplicatedPriceDialog'
import { useProducts } from '../../hooks/api/useProducts'
import { Collapse } from '@mui/material'
import { usePriceSets } from '../../hooks/api/usePriceSets'
import { usePriceSetPrices } from '../../hooks/api/usePrices'

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
  return (u as { success?: boolean }).success === false
}

interface Params {
  id?: string
}

type ValChangeEvent = ChangeEvent<{ value: string }>

const ClientEditor = () => {
  const auth = useAuth()
  const params = useParams() as Params
  const navigate = useNavigate()

  const mode = params.id === undefined ? 'CREATE' : 'EDIT'
  const editId = params.id !== undefined ? params.id : null

  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [notes, setNotes] = useState('')
  const [defaultCash, setDefaultCash] = useState<'true' | 'false'>('false')
  const [priceMode, setPriceMode] = useState<'priceSet' | 'custom'>('priceSet')
  const [selectedPriceSetId, setSelectedPriceSetId] = useState('')

  // Restore state
  useEffect(() => {
    (async () => {
      const defaults = await (
        mode === 'CREATE' && !editId
          ? fetchJsonAuth<ClientDefaults>('/api/clients/defaultsForNew', auth)
          : fetchJsonAuth<ClientDefaults>(`/api/clients/${editId}`, auth)
      )

      if (isClientError(defaults)) {
        const error = defaults.error
        console.error(error)
        if (error.code === 'not_found') {
          const msg = `No se encontró el cliente que se buscaba, (Nota: id = ${editId}).`
          setError(msg)
        } else {
          setError(error.message)
        }
        return
      }

      if (mode === 'CREATE') {
        const createDefaults = defaults
        setCode(createDefaults.code)
      } else {
        const editDefaults = defaults as DetailedClient
        setCode(editDefaults.code)
        setName(editDefaults.name)
        setDefaultCash(editDefaults.defaultCash ? 'true' : 'false')
        setNotes(editDefaults.notes || '')
        const prices = editDefaults.Prices.map(pr => ({ ...pr, value: pr.value }))
        setPrices(prices)
        setPriceMode(editDefaults.priceSetId ? 'priceSet' : 'custom')
        setSelectedPriceSetId(
          editDefaults.priceSetId ? String(editDefaults.priceSetId) : '',
        )
      }
    })()
  }, [auth, editId, mode])


  const [errorDuplicatedPrice, setErrorDuplicatedPrice] = useState<PriceError | null>(null)
  const handleCloseDuplicatedPrice = useCallback(() => {
    setErrorDuplicatedPrice(null)
  }, [setErrorDuplicatedPrice])

  const [errorSubmitting, setErrorSubmitting] = useState(false)
  const [errorDuplicatedField, setErrorDuplicatedField] = useState<'name' | 'code' | null>(null)
  const [errorEmptyName, setErrorEmptyName] = useState(false)
  const [errorEmptyCode, setErrorEmptyCode] = useState(false)

  const displayName = { name: 'nombre', code: 'código' }
  const fieldsForDesc = { name, code }

  const getFieldDesc = (field: 'name' | 'code') =>
    `${displayName[field]} ${fieldsForDesc[field]}`

  const handleNameChange = useCallback((event: ValChangeEvent) => {
    setName(event.target.value)
    setErrorEmptyName(false)
    if (errorDuplicatedField === 'name')
      setErrorDuplicatedField(null)
  }, [errorDuplicatedField])

  const handleCodeChange = useCallback((event: ValChangeEvent) => {
    setCode(event.target.value)
    setErrorEmptyCode(false)
    if (errorDuplicatedField === 'code')
      setErrorDuplicatedField(null)
  }, [errorDuplicatedField])

  const handleNotesChange = useCallback((event: ValChangeEvent) => {
    setNotes(event.target.value)
  }, [])

  const handleDefaultCashChange = useCallback((event: SelectChangeEvent) => {
    if (event.target.value !== 'true' && event.target.value !== 'false') {
      console.error('Invalid value for defaultCash')
      return
    }
    setDefaultCash(event.target.value)
  }, [])

  const handlePriceModeChange = useCallback((event: SelectChangeEvent) => {
    if (event.target.value !== 'priceSet' && event.target.value !== 'custom') {
      console.error('Invalid value for priceMode')
      return
    }
    setPriceMode(event.target.value)
  }, [])

  const [prices, setPrices] = useState<IncompletePrice[]>([])

  const [products] = useProducts()
  const [priceSets] = usePriceSets()
  const selectedPriceSetIdNum = selectedPriceSetId === '' ? undefined : Number(selectedPriceSetId)
  const [priceSetPrices] = usePriceSetPrices(selectedPriceSetIdNum)

  const handlePriceSetChange = useCallback((event: SelectChangeEvent) => {
    setSelectedPriceSetId(event.target.value)
  }, [])

  const handlePriceDelete = (priceIndex: number) => {
    setPrices(prevPrices => [
      ...prevPrices.slice(0, priceIndex),
      ...prevPrices.slice(priceIndex + 1),
    ])
  }

  const handleNewPrice = useCallback((price: IncompletePrice) => {
    const duplicated = prices.findIndex(pr =>
      pr.name === price.name && pr.productId === price.productId,
    ) !== -1

    if (duplicated) {
      const product = products?.find(p => p.id === price.productId)

      setErrorDuplicatedPrice({
        priceName: price.name,
        productName: product?.name ?? 'Producto desconocido',
      })

      return
    }

    setPrices([...prices, price])
  }, [prices, products])

  const handleSubmit = useCallback(() => {
    (async () => {
      let res: SuccessResponse | ErrorResponse | null = null

      if (name === '')
        setErrorEmptyName(true)


      if (code === '')
        setErrorEmptyCode(true)


      if (code === '' || name === '') return

      let priceSetIdPayload = selectedPriceSetIdNum ?? null
      if (priceMode !== 'priceSet') priceSetIdPayload = null

      const body = JSON.stringify({
        name,
        code,
        defaultCash: defaultCash === 'true',
        notes,
        priceSetId: priceSetIdPayload,
        prices: priceSetIdPayload === null ? prices : [],
      })

      if (mode === 'CREATE') {
        res = await fetchJsonAuth('/api/clients/create', auth, {
          method: 'post',
          body,
        })
      } else if (editId) {
        res = await fetchJsonAuth(`/api/clients/${editId}`, auth, {
          method: 'PATCH',
          body,
        })
      } else {
        setError('Incosistencia de programa: No se tiene el id del cliente en modo edición')
        return
      }

      if (isErrorResponse(res)) {
        if (res.error.code === 'validation_error' && res.error.errors && res.error.errors[0]) {
          const field = res.error.errors[0].path
          if (field === 'name' || field === 'code')
            setErrorDuplicatedField(field)

          return
        }
        setErrorSubmitting(true)
        console.error(res)
        return
      }

      navigate('/clients')
    })()
  }, [auth, code, defaultCash, editId, mode, name, navigate, notes, priceMode, prices, selectedPriceSetIdNum])

  if (!products) return <LoadingScreen text='Cargando productos...' />
  if (!priceSets) return <LoadingScreen text='Cargando conjuntos de precios...' />

  return (
    (<Layout title='Editando cliente' container={ResponsiveContainer}>
      <DuplicatedPriceDialog
        priceError={errorDuplicatedPrice}
        onClose={handleCloseDuplicatedPrice}
      />
      {error
        ? <Alert
          type='error'
          message={error}
        />
        : <>
          <MyPaper>
            <Title>
              {mode === 'CREATE'
                ? 'Crear Nuevo Cliente'
                : `Editando Cliente ${name}`
              }
            </Title>
            {errorSubmitting
              && <Alert
                type='error'
                message={
                  'Error '
                  + (mode === 'CREATE' ? 'creando' : 'actualizando')
                  + ' el cliente favor intentarlo nuevamente'
                }
              />
            }
            {errorDuplicatedField
              && <Alert
                type='error'
                message={
                  'Error: El ' + getFieldDesc(errorDuplicatedField) + ' ya existe.'
                }
              />
            }
            <form autoComplete='off'>
              <TextField
                id='code'
                label='Código'
                margin='normal'
                fullWidth
                value={code}
                onChange={handleCodeChange}
                error={errorEmptyCode}
                helperText={errorEmptyCode ? 'Especifique un código' : null}
              />
              <TextField
                id='name'
                label='Nombre'
                margin='normal'
                fullWidth
                value={name}
                onChange={handleNameChange}
                error={errorEmptyName}
                helperText={errorEmptyName ? 'Especifique un nombre' : null}
              />
              <TextField
                id='notes'
                label='Informacion de Contacto'
                margin='normal'
                fullWidth
                multiline
                rows={3}
                variant='outlined'
                value={notes}
                onChange={handleNotesChange}
              />
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='defaultCash'>Pago</InputLabel>
                <Select
                  inputProps={{
                    name: 'defaultCash',
                    id: 'defaultCash',
                  }}
                  onChange={handleDefaultCashChange}
                  value={defaultCash}
                >
                  <MenuItem value='false'>Pago Postfechado</MenuItem>
                  <MenuItem value='true'>Pago en Efectivo</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <InputLabel htmlFor='priceMode'>Precios</InputLabel>
                <Select
                  inputProps={{
                    name: 'priceMode',
                    id: 'priceMode',
                  }}
                  value={priceMode}
                  onChange={handlePriceModeChange}
                >
                  <MenuItem value='priceSet'>Conjunto de Precios</MenuItem>
                  <MenuItem value='custom'>Precios personalizados</MenuItem>
                </Select>
              </FormControl>
              <Collapse in={priceMode === 'priceSet'}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel htmlFor='priceSet'>Conjunto de Precios</InputLabel>
                  <Select
                    inputProps={{
                      name: 'priceSet',
                      id: 'priceSet',
                    }}
                    value={selectedPriceSetId}
                    onChange={handlePriceSetChange}
                  >
                    <MenuItem value=''>Seleccionar...</MenuItem>
                    {priceSets.map(ps => (
                      <MenuItem key={ps.id} value={ps.id}>
                        {ps.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Collapse>
            </form>
          </MyPaper>
          {priceMode === 'priceSet'
            ? <PriceShow prices={priceSetPrices ?? []} products={products} />
            : <EditablePrices
              clientName={name}
              prices={prices}
              products={products}
              onNewPrice={handleNewPrice}
              onPriceDelete={handlePriceDelete}
            />
          }
          <MyPaper>
            <Button
              variant='contained'
              color='primary'
              fullWidth={true}
              onClick={handleSubmit}
            >
              {mode === 'CREATE'
                ? 'Crear Cliente'
                : 'Actualizar Cliente'
              }
            </Button>
          </MyPaper>
        </>
      }
    </Layout>)
  )
}

interface PricesSectionProps {
  prices: IncompletePrice[]
  products: Product[]
  clientName: string
  onNewPrice: (price: IncompletePrice) => void
  onPriceDelete: (priceIndex: number) => void
}

const EditablePrices = (props: PricesSectionProps) => {
  const { prices, products, clientName, onNewPrice, onPriceDelete } = props
  const getProductName = (id: number) => {
    const product = products.find(p => p.id === id)
    if (product)
      return product.name

    return `Producto con id ${id}`
  }

  return (
    <>
      {prices.map((pr, idx) => (
        <MyPaper key={idx}>
          {pr.name !== 'Base' && <>
            <Typography variant='subtitle2'>{pr.name}</Typography>
            <Divider />
          </>}
          <Typography variant='body1'>
            {getProductName(pr.productId)} a {money(pr.value)}
          </Typography>
          <DeleteButton
            onClick={() => {
              onPriceDelete(idx)
            }}
            size="large">
            <DeleteIcon />
          </DeleteButton>
        </MyPaper>
      ))}
      <PricePicker
        clientName={clientName}
        products={products}
        onNewPrice={onNewPrice}
      />
    </>
  )
}

interface PriceShowProps {
  prices: IncompletePrice[]
  products: Product[]
}

const PriceShow = ({ prices, products }: PriceShowProps) => {
  const getProductName = (id: number) => {
    const product = products.find(p => p.id === id)
    if (product)
      return product.name

    return `Producto con id ${id}`
  }
  return (
    <>
      {prices.map((pr, idx) => (
        <MyPaper key={idx}>
          {pr.name !== 'Base' && <>
            <Typography variant='subtitle2'>{pr.name}</Typography>
            <Divider />
          </>}
          <Typography variant='body1'>
            {getProductName(pr.productId)} a {money(pr.value)}
          </Typography>
        </MyPaper>
      ))}
    </>
  )
}

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: 'red',
  position: 'absolute',
  right: '0',
  top: '50%',
  transform: 'translateY(-50%)',
  marginRight: theme.spacing(4),
}))

const MyPaper = styled(Paper)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
}))

export default adminOnly(ClientEditor)
