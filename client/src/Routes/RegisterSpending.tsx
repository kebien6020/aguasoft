import { useCallback, useState } from 'react'
import { Button, Grid2 as Grid, Paper, Switch, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { startOfDay } from 'date-fns'

import { Theme } from '../theme'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import useUser from '../hooks/useUser'
import Alert from '../components/Alert'
import Layout from '../components/Layout'
import DatePicker from '../components/MyDatePicker'
import PriceField from '../components/PriceField'
import ResponsiveContainer from '../components/ResponsiveContainer'
import Title from '../components/Title'
import {
  ErrorResponse,
  fetchJsonAuth,
  isErrorResponse,
  SuccessResponse,
} from '../utils'

type ValChangeEvent = { target: { value: string } }
type CheckedChangeEvent = { target: { checked: boolean } }

const startOfToday = startOfDay(new Date)

const RegisterSpending = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const user = useUser()
  const userIsAdmin = user?.user?.role === 'admin'

  const [date, setDate] = useState(startOfToday)
  const [description, setDescription] = useState('')
  const [moneyAmount, setMoneyAmount] = useState('')
  const [fromCash, setFromCash] = useState(true)
  const [isTransfer, setIsTransfer] = useState(false)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [moneyAmountError, setMoneyAmountError] = useState<string | null>(null)
  const [submitionError, setSubmitionError] = useState<string | null>(null)

  const handleChangeDescription = useCallback((event: ValChangeEvent) => {
    setDescription(event.target.value)
    setDescriptionError(null)
  }, [])

  const handleChangeMoneyAmount = useCallback((event: ValChangeEvent) => {
    setMoneyAmount(event.target.value)
    setMoneyAmountError(null)
  }, [])

  const handleChangeFromCash = useCallback((event: CheckedChangeEvent) => {
    setFromCash(event.target.checked)
  }, [])

  const handleChangeIsTransfer = useCallback((event: CheckedChangeEvent) => {
    setIsTransfer(event.target.checked)
  }, [])

  const validateForm = useCallback(() => {
    let ok = true

    if (description === '') {
      setDescriptionError('Obligatorio')
      ok = false
    } else if (description.length <= 3) {
      setDescriptionError('Descripción muy corta')
      ok = false
    }

    if (moneyAmount === '') {
      setMoneyAmountError('Obligatorio')
      ok = false
    } else if (Number(moneyAmount) === 0) {
      setMoneyAmountError('La salida no puede ser $0')
      ok = false
    }

    return ok
  }, [description, moneyAmount])

  const handleSubmit = async () => {
    const valid = validateForm()
    if (!valid) return

    interface Payload {
      description: string
      value: number
      fromCash: boolean
      isTransfer: boolean
      date?: string
    }
    const payload: Payload = {
      description,
      value: Number(moneyAmount),
      fromCash,
      isTransfer,
    }

    if (userIsAdmin)
      payload.date = date.toISOString()

    const response: SuccessResponse | ErrorResponse =
      await fetchJsonAuth('/api/spendings/new', auth, {
        method: 'post',
        body: JSON.stringify(payload),
      })

    if (isErrorResponse(response)) {
      setSubmitionError('Error al intentar registrar la salida.')
      console.error(response.error)
      return
    }

    navigate('/spendings')
  }

  return (
    <Layout title='Registrar Salida' container={ResponsiveContainer}>
      <Wrapper>
        <Title>Registrar Salida</Title>
        {submitionError !== null
          && <Alert message={submitionError} type='error' />
        }
        <form>
          <Grid container spacing={0} justifyContent='space-between'>
            {userIsAdmin
              && <Grid size={{ xs: 12 }}>
                <DatePicker
                  label='Fecha de la salida'
                  date={date}
                  onDateChange={setDate}
                  DatePickerProps={{
                    slotProps: {
                      textField: {
                        fullWidth: true,
                      },
                    },
                  }}
                />
              </Grid>
            }
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='Descripción'
                onChange={handleChangeDescription}
                value={description}
                error={descriptionError !== null}
                helperText={descriptionError}
                margin='normal'
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PriceField
                label='Dinero de salida'
                onChange={handleChangeMoneyAmount}
                value={moneyAmount}
                TextFieldProps={{
                  error: moneyAmountError !== null,
                  helperText: moneyAmountError,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant='body2'>
                De ganacias del día
                <Switch
                  checked={fromCash}
                  onChange={handleChangeFromCash}
                />
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant='body2'>
                Es transferencia a Bogotá
                <Switch
                  checked={isTransfer}
                  onChange={handleChangeIsTransfer}
                />
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ pt: 4 }}>
              <Button
                variant='contained'
                color='primary'
                fullWidth
                onClick={handleSubmit}
              >
                Registrar Salida
              </Button>
            </Grid>
          </Grid>
        </form>
      </Wrapper>
    </Layout>
  )
}

const Wrapper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  paddingTop: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

export default RegisterSpending
