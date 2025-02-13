import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import useFetch from '../hooks/useFetch'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import Title from '../components/Title'
import SelectField from '../components/form/SelectField'
import SubmitButton from '../components/form/SubmitButton'
import TextField from '../components/form/TextField'
import Yup from '../components/form/Yup'
import {
  isNumber,
  fetchJsonAuth,
  SuccessResponse,
  ErrorResponse,
  isErrorResponse,
  NotEnoughInSourceError,
} from '../utils'
import { useFormikContext, FormikContextType } from 'formik'
import usePrevious from '../hooks/usePrevious'
import { MachineCounter } from '../models'
import Collapse from '../components/Collapse'
import { Theme } from '../theme'
import { useNavigate } from 'react-router-dom'

type ProductionType =
  | 'bolsa-360'
  | 'paca-360'
  | 'bolsa-6l'
  | 'hielo-5kg'
  | 'hielo-2kg'
  | 'bolsa-360-congelada'
  | 'barra-hielo'

interface ProductionTypeOption {
  value: ProductionType
  label: string
}

const productionTypeOptions: ProductionTypeOption[] = [
  { value: 'bolsa-360', label: 'Bolsas de 360 Individuales' },
  { value: 'paca-360', label: 'Empaque de Pacas 360' },
  { value: 'bolsa-6l', label: 'Bolsas de 6 Litros' },
  { value: 'hielo-5kg', label: 'Hielo 5Kg' },
  { value: 'hielo-2kg', label: 'Hielo 2Kg' },
  { value: 'bolsa-360-congelada', label: 'Bolsa 360 Congelada' },
  { value: 'barra-hielo', label: 'Barras de Hielo' },
]

interface Values {
  productionType: ProductionType | ''
  counterStart: string
  counterEnd: string
  amount: string
  damaged: string
}

const validationSchema = Yup.object({
  productionType: Yup.mixed<ProductionType>().oneOf(productionTypeOptions.map(opt => opt.value)).required(),
  counterStart: Yup.mixed().when('productionType', {
    is: 'bolsa-360',
    then: Yup.number().integer().positive().required(),
  }),
  counterEnd: Yup.mixed().when('productionType', {
    is: 'bolsa-360',
    then: Yup.number().integer().positive().moreThan(Yup.ref('counterStart')).required(),
  }),
  amount: Yup.mixed().when('productionType', {
    is: (t: string) => ['paca-360', 'barra-hielo', 'hielo-5kg', 'hielo-2kg'].includes(t),
    then: Yup.number().integer().min(0).required(),
  }),
  damaged: Yup.mixed().when('productionType', {
    is: (t: string) => ['paca-360', 'hielo-5kg', 'hielo-2kg'].includes(t),
    then: Yup.number().integer().min(0).required(),
  }),
})

interface DamagedAutofillProps {
  detectDamaged: boolean
  quantityInIntermediate: number | null
}

const DamagedAutofill = (props: DamagedAutofillProps) => {
  const { detectDamaged, quantityInIntermediate } = props

  const { values, setFieldValue }: FormikContextType<Values> = useFormikContext()

  useEffect(() => {
    if (values.productionType !== 'paca-360') return
    if (detectDamaged) {
      if (quantityInIntermediate === null) {
        setFieldValue('damaged', 'Cargando…')
        return
      }

      const produced = Number(values.amount) || 0
      const left = quantityInIntermediate - produced * 20

      setFieldValue('damaged', String(left))

    } else {
      setFieldValue('damaged', '0')
    }
  }, [detectDamaged, quantityInIntermediate, setFieldValue, values.amount, values.productionType])

  const prevProductionType = usePrevious(values.productionType)

  useEffect(() => {
    // When changing to productionType other than paca-360, reset damaged to 0
    if (prevProductionType === 'paca-360' && values.productionType !== 'paca-360')
      setFieldValue('damaged', '0')
  }, [values.productionType, prevProductionType, setFieldValue])

  return null
}

const RegisterProduction = (): JSX.Element => {
  const classes = useStyles()
  const auth = useAuth()
  const showMessage = useSnackbar()

  const [initialValues, setInitialValues] = useState<Values>({
    productionType: '' as ProductionType | '',
    counterStart: '',
    counterEnd: '',
    amount: '',
    damaged: '0',
  })

  const [lastMachineCounter] = useFetch<MachineCounter>('/api/machine-counters/most-recent/production', {
    showError: showMessage,
    name: 'el ultimo contador de la maquina de bolsas de 360ml',
  })

  useEffect(() => {
    if (lastMachineCounter !== null)
      setInitialValues(prev => ({ ...prev, counterStart: String(lastMachineCounter.value) }))

  }, [lastMachineCounter])

  const [detectDamaged, setDetectDamaged] = useState(true)

  const [intermediateState] = useFetch<{ 'bolsa-360': number }>('/api/inventory/state/intermediate', {
    showError: showMessage,
    name: 'el estado actual del inventario',
  })

  const quantityInIntermediate =
    intermediateState && !isErrorResponse(intermediateState)
      ? intermediateState['bolsa-360']
      : null

  const navigate = useNavigate()
  const handleSubmit = async (values: Values) => {
    const url = '/api/inventory/movements/production'

    const pType = values.productionType

    let payload: Record<string, unknown> = {
      productionType: pType,
    }

    if (pType === 'bolsa-360') {
      payload = {
        ...payload,
        amount: Number(values.counterEnd) - Number(values.counterStart),
        counterEnd: Number(values.counterEnd),
      }
    }

    if (['paca-360', 'bolsa-6l', 'hielo-5kg', 'hielo-2kg', 'bolsa-360-congelada'].includes(pType)) {
      payload = {
        ...payload,
        amount: Number(values.amount),
        damaged: Number(values.damaged),
      }
    }

    if (pType === 'barra-hielo') {
      payload = {
        ...payload,
        amount: Number(values.amount),
      }
    }

    const response: SuccessResponse | ErrorResponse = await fetchJsonAuth(url, auth, {
      method: 'post',
      body: JSON.stringify(payload),
    })

    if (isErrorResponse(response)) {
      const res = response
      const msg = (() => {
        if (res.error.code === 'not_enough_in_source') {
          const error = res.error as NotEnoughInSourceError

          const storageName = error.storageName || 'Desconocido'
          const elementName = error.inventoryElementName || 'Desconocido'

          return `No hay suficiente cantidad del elemento ${elementName} en el almacen ${storageName}`
        }

        return res.error.message
      })()

      showMessage('Error al registrar la producción: ' + msg)
      return
    }

    showMessage('Guardado exitoso')
    navigate('/movements')
  }

  return (
    <Layout title='Registrar Producción'>
      <Paper className={classes.paper}>
        <Title>Registrar Producción</Title>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values }) => <>
            <Grid size={{ xs: 12 }}>
              <SelectField
                name='productionType'
                label='Tipo de Producción'
                emptyOption='Seleccione un tipo de producción'
                options={productionTypeOptions}
              />
            </Grid>
            <Collapse in={values.productionType === 'bolsa-360'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name='counterStart'
                  label='Contador Total Inicial'
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name='counterEnd'
                  label='Contador Total Final'
                />
              </Grid>
            </Collapse>
            <Collapse in={
              values.productionType === 'bolsa-360'
              && isNumber(values.counterStart)
              && isNumber(values.counterEnd)
              && Number(values.counterStart) < Number(values.counterEnd)
            }>
              <Grid size={{ xs: 12 }}>
                <Typography>
                  Se registrará una producción de
                  {Number(values.counterEnd) - Number(values.counterStart)}
                  bolsas de 360ml individuales.
                </Typography>
              </Grid>
            </Collapse>
            <Collapse in={values.productionType === 'paca-360'}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name='amount'
                  label='Cantidad de Pacas producida'
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }} style={{ display: 'flex', flexFlow: 'column', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={detectDamaged}
                      onChange={e => setDetectDamaged(e.target.checked)}
                    />
                  }
                  label='Area intermedia queda vacía'
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <DamagedAutofill detectDamaged={detectDamaged} quantityInIntermediate={quantityInIntermediate} />
                <TextField
                  name='damaged'
                  label='Bolsas individuales dañadas'
                  disabled={detectDamaged}
                />
              </Grid>
            </Collapse>
            <Collapse in={
              values.productionType === 'bolsa-6l'
              || values.productionType === 'hielo-5kg'
              || values.productionType === 'hielo-2kg'
              || values.productionType === 'bolsa-360-congelada'
            }>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name='amount'
                  label='Cantidad producida'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name='damaged'
                  label='Bolsas dañadas'
                />
              </Grid>
            </Collapse>
            <Collapse in={values.productionType === 'barra-hielo'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name='amount'
                  label='Cantidad producida'
                />
              </Grid>
            </Collapse>
            <Collapse in={values.productionType !== ''}>
              <SubmitButton />
            </Collapse>
          </>}
        </Form>
      </Paper>
    </Layout>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}))

export default RegisterProduction
