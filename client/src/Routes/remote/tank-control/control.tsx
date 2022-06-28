import * as React from 'react'
import {
  ButtonProps,
  Button,
  Typography,
  TypographyProps,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  styled,
  FormControl,
  FormLabel,
  Divider,
  Grid,
} from '@material-ui/core'

import { useApi } from '../../../api'
import { VSpace } from '../../../components/utils'
import { Formik, useField, Form } from 'formik'

export const Control = (): JSX.Element => {
  const api = useApi()
  const action = (name: string, json?: Record<string, unknown>) => () => {
    void api.post(`remote/action/agua-tank-control/${name}`, { json }).json().catch(console.error)
  }

  return (
    <>
      <Title1>Acueducto</Title1>
      <Wrapper>
        <Grid container spacing={2} style={{ alignItems: 'stretch' }}>
          <Grid item xs={4}><Btn onClick={action('aq_fill')}>Llenar</Btn></Grid>
          <Grid item xs={4}><Btn onClick={action('aq_fill_pump')}>Llenar con bomba</Btn></Grid>
          <Grid item xs={4}><Btn onClick={action('aq_stop')}>Detener</Btn></Grid>
        </Grid>
      </Wrapper>
      <VSpace />
      <Title1>Tanques Etapa 1</Title1>
      <Wrapper>
        <Title2>Llenar</Title2>
        <FillForm />

        <Sep />
        <Title2>Recircular</Title2>
        <RecirForm />

        <Sep />
        <Title2>General</Title2>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Btn onClick={action('s1_clear_alarm')}>Borrar Alarma</Btn>
          </Grid>
          <Grid item xs={6}>
            <Btn onClick={action('s1_stop')}>Detener</Btn>
          </Grid>
        </Grid>
      </Wrapper>
      <Title1>Tanques Etapa 2</Title1>
      <Wrapper>
        <Title2>Transferir</Title2>
        <Btn onClick={action('s2_transfer')}>Iniciar Transferencia</Btn>
        <Title2>Valvulas</Title2>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Btn onClick={action('s2_confirm', { tank: 'tank1' })}>Confirmar válvulas para tanque 1</Btn>
          </Grid>
          <Grid item xs={6}>
            <Btn onClick={action('s2_confirm', { tank: 'tank2' })}>Confirmar válvulas para tanque 2</Btn>
          </Grid>
        </Grid>
        <Title2>General</Title2>
        <Btn onClick={action('s2_stop')}>Detener</Btn>
      </Wrapper>
    </>
  )
}

interface FillValues {
  tank: 'tank1' | 'tank2'
}
const fillInitVals: FillValues = {
  tank: 'tank1',
}

const FillForm = () => {
  const api = useApi()

  const submit = async (values: FillValues) => {
    await api
      .post('remote/action/agua-tank-control/s1_fill', { json: values })
      .json()
      .catch(console.error)
  }

  return (
    <Formik initialValues={fillInitVals} onSubmit={submit}>
      <Form>
        <TankPicker />
        <Btn type='submit'>Llenar</Btn>
      </Form>
    </Formik>
  )
}

interface RecirValues {
  tank: 'tank1' | 'tank2'
  duration_ms: 'short' | 'long'
}

const recirInitVals = {
  tank: 'tank1',
  duration_ms: 'short',
}

const RecirForm = () => {
  const api = useApi()

  const submit = async (values: RecirValues) => {
    const json = {
      tank: values.tank,
      duration_ms: values.duration_ms === 'short' ? 5 * 60 * 1000 : 40 * 60 * 1000,
    }
    await api
      .post('remote/action/agua-tank-control/s1_recir', { json })
      .json()
      .catch(console.error)
  }

  return (
    <Formik initialValues={recirInitVals} onSubmit={submit}>
      <Form>
        <TankPicker />
        <RecirDurationPicker />
        <Btn type='submit'>Recircular</Btn>
      </Form>
    </Formik>
  )
}

const Title1 = (props: TypographyProps<'h1'>) =>
  <Typography component='h1' variant='h6' color='primary' gutterBottom {...props} />

const Title2 = styled(
  (props: TypographyProps<'h2'>) =>
    <Typography component='h2' variant='h6' color='primary' gutterBottom {...props} />
)({
  fontSize: '1rem',
})

const Btn = styled((props: ButtonProps) =>
  <Button variant='contained' color='default' fullWidth {...props} />
)({
  height: '100%',
})

const Sep = () => (
  <>
    <VSpace />
    <Divider />
    <VSpace />
  </>
)

const Wrapper = styled(Paper)({
  padding: 16,
  display: 'flex',
  flexFlow: 'column',
})

interface TankPickerProps {
  name?: string
}

const TankPicker = ({ name = 'tank' }: TankPickerProps) => {
  const [field] = useField(name)
  return (
    <FormControl component='fieldset'>
      <FormLabel component='legend'>Tanque</FormLabel>
      <RadioGroup row {...field}>
        <FormControlLabel control={<Radio />} value='tank1' label='Tanque 1' />
        <FormControlLabel control={<Radio />} value='tank2' label='Tanque 2' />
      </RadioGroup>
    </FormControl>
  )
}

const RecirDurationPicker = ({ name = 'duration_ms' }) => {
  const [field] = useField(name)

  return (
    <FormControl component='fieldset'>
      <FormLabel component='legend'>Duración</FormLabel>
      <RadioGroup row {...field}>
        <FormControlLabel control={<Radio />} value='short' label='Hipoclorito de Sodio (5 min)' />
        <FormControlLabel control={<Radio />} value='long' label='Hidroxicloruro de Aluminio (40 min)' />
      </RadioGroup>
    </FormControl>
  )
}
