import type { JSX } from 'react'
import { Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { addDays, startOfDay, subDays } from 'date-fns'
import { useFormikContext } from 'formik'
import { DateField } from '../../../components/form/DateField'
import Form from '../../../components/form/Form'
import { PriceField } from '../../../components/form/PriceField'
import SubmitButton from '../../../components/form/SubmitButton'
import Yup from '../../../components/form/Yup'
import { useBalance } from '../../../hooks/api/useBalance'
import useAuth from '../../../hooks/useAuth'
import useSnackbar from '../../../hooks/useSnackbar'
import {
  fetchJsonAuth,
  isErrorResponse,
  moneySign,
  SuccessResponse,
} from '../../../utils'
import { Theme } from '../../../theme'

const initialValues = {
  date: new Date,
  value: '',
}
const validationSchema = Yup.object({
  date: Yup.date().typeError('Debe ser una fecha válida').required(),
  value: Yup.number().typeError('Debe ser un número').required(),
})
type Values = typeof initialValues

type CreateVerificationFormProps = {
  onCreated?: () => void
}

const noop = () => { /* noop */ }

export const CreateVerificationForm = ({ onCreated = noop }: CreateVerificationFormProps): JSX.Element => {
  const auth = useAuth()
  const snackbar = useSnackbar()

  const handleSubmit = async (values: Values) => {
    const url = '/api/balance/verification'
    const method = 'post'
    const body = JSON.stringify({
      date: values.date.toISOString(),
      amount: values.value,
    })

    const res = await fetchJsonAuth(url, auth, {
      method,
      body,
    })

    if (isErrorResponse(res)) {
      snackbar(res.error.message)
      console.warn(res.error)
      return
    }

    snackbar('Verificación creada exitosamente')
    onCreated()
  }

  return (
    <StyledForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <CreateVerificationFormImpl />
    </StyledForm>
  )
}

const StyledForm = styled(Form)(({ theme }: { theme: Theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
})) as typeof Form

const CreateVerificationFormImpl = () => {
  const { values } = useFormikContext<Values>()
  const { date, value } = values
  const [prevBalance] = useBalance(subDays(date, 1))
  const numVal = Number(value)
  const adjust = prevBalance !== null && !isNaN(numVal) && value !== ''
    ? numVal - prevBalance
    : undefined
  const tomorrow = startOfDay(addDays(new Date, 1))

  return (<>
    <Grid>
      <StyledDateField
        name='date'
        label='Fecha de la Verificación'
        DatePickerProps={{
          slotProps: {
            textField: {
              helperText: 'Toma efecto al inicio del día',
            },
          },
          maxDate: tomorrow,
          disableFuture: false,
        }}
      />
    </Grid>
    <Grid flexGrow={1}>
      <PriceField
        name='value'
        label='Valor verificado'
        TextFieldProps={{
          helperText: adjust !== undefined ? `La verificación registrará un ajuste de ${moneySign(adjust)}` : undefined,
        }}
      />
    </Grid>
    <Grid size={{ xs: 12 }} container direction='row' justifyContent='center'>
      <SubmitButton>Crear</SubmitButton>
    </Grid>
  </>)
}

const StyledDateField = styled(DateField)({
  marginTop: '16px !important',
  marginBottom: '8px !important',
})
