import {
  Card,
  CardContent,
  CardHeader,
  CardProps,
  Grid,
  Paper,
  Theme,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { FormikValues, FormikHelpers } from 'formik'
import { blue, green, indigo, orange, pink, purple, yellow } from '@mui/material/colors'

import Layout from '../components/Layout'
import Title from '../components/Title'
import Form from '../components/form/Form'
import { DateField } from '../components/form/DateField'
import SelectField from '../components/form/SelectField'
import SubmitButton from '../components/form/SubmitButton'
import { optionsFromBatchCategories, useBatchCategories } from '../hooks/api/useBatchCategories'
import useSnackbar from '../hooks/useSnackbar'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import useAuth from '../hooks/useAuth'
import { useBatches } from '../hooks/api/useBatches'
import type { Batch } from '../models'
import LoadingIndicator from '../components/LoadingIndicator'
import { FC } from 'react'

const Batches = () => {
  const [batches, refresh] = useBatches({ include: ['BatchCategory'] })

  return (
    <Layout title='Lotes'>
      <Title>Crear Lote</Title>
      <CreateBatchForm refresh={refresh} />

      <Title>Lotes</Title>
      <BatchList batches={batches} />
    </Layout>
  )
}
export default Batches

const batchFormInitialValues = {
  date: new Date,
  batchCategory: '',
}

type FormValues = typeof batchFormInitialValues

const batchFormSchema = Yup.object({
  date: Yup.date().required(),
  batchCategory: Yup.number().required(),
})

interface CreateBatchFormProps {
  refresh: () => unknown
}

const CreateBatchForm = ({ refresh }: CreateBatchFormProps) => {
  const showError = useSnackbar()
  const auth = useAuth()

  const handleSubmit = async (values: FormValues, _formikHelpers: FormikHelpers<FormikValues>) => {
    const payload = {
      date: values.date,
      batchCategoryId: Number(values.batchCategory),
    }

    const url = '/api/batches'
    const res = await fetchJsonAuth(url, auth, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (isErrorResponse(res)) {
      showError(`Error al crear el lote: ${res.error.message}`)
      return
    }

    refresh()
  }

  const [batchCategories] = useBatchCategories()
  const options = optionsFromBatchCategories(batchCategories)

  return (
    <Wrapper>
      <Form
        initialValues={batchFormInitialValues}
        validationSchema={batchFormSchema}
        onSubmit={handleSubmit}
        gridProps={{ direction: 'row', alignItems: 'center' }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <DateField name='date' label='Fecha del lote' />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField name='batchCategory' label='Categoría de Lote' options={options} />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <SubmitButton>Crear</SubmitButton>
        </Grid>
      </Form>
    </Wrapper>
  )
}

const Wrapper = styled(Paper)({
  padding: 8,
})

interface BatchListProps {
  batches: Batch[] | undefined
}

const BatchList = ({ batches }: BatchListProps) => {
  if (!batches) return <LoadingIndicator />

  console.log(batches)

  return (
    <>
      {batches.map(b =>
        <BatchCard batch={b} key={String(b.id)} />,
      )}
    </>
  )
}

const BatchCard = ({ batch }: { batch: Batch }) => (
  <StyledCard colorKey={batch.BatchCategory?.code ?? ''}>
    <CardHeader title={batch.code} />
    <CardContent>
      <Typography variant='body2'>
        Categoría: {batch.BatchCategory?.name}
      </Typography>
    </CardContent>
  </StyledCard>
)

const colorMap: Record<string, string> = {
  'bolsa-360': blue[500],
  'bolsa-6l': green[500],
  botellon: yellow[500],
  'hielo-5kg': orange[500],
  'botellon-nuevo': indigo[500],
  'hielo-2kg': purple[500],
  'barra-hielo': pink[500],
}

interface StyledCardProps extends CardProps {
  colorKey: string
}

type StyledCardPropsWithTheme = StyledCardProps & { theme: Theme }

const StyledCard = styled(Card)(({ colorKey, theme }: StyledCardPropsWithTheme) => ({
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  borderLeftColor: colorMap[colorKey] ?? theme.palette.grey,
})) as FC<StyledCardProps>
