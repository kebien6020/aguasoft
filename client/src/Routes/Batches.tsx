import Layout from '../components/Layout'
import Title from '../components/Title'
import Form from '../components/form/Form'
import { FormikValues, FormikHelpers } from 'formik'
import { DateField } from '../components/form/DateField'
import SelectField from '../components/form/SelectField'
import { Card, CardContent, CardHeader, Grid, Paper, Theme, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import SubmitButton from '../components/form/SubmitButton'
import { optionsFromBatchCategories, useBatchCategories } from '../hooks/api/useBatchCategories'
import useSnackbar from '../hooks/useSnackbar'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import useAuth from '../hooks/useAuth'
import { useBatches } from '../hooks/api/useBatches'
import type { Batch } from '../models'
import LoadingIndicator from '../components/LoadingIndicator'
import * as colors from '@mui/material/colors'

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
        <Grid item xs={12} md={4}>
          <DateField name='date' label='Fecha del lote' />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectField name='batchCategory' label='Categoría de Lote' options={options} />
        </Grid>
        <Grid item xs={12} md={2}>
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
        <BatchCard batch={b} key={String(b.id)} />
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

const colorMap = {
  'bolsa-360': colors.blue[500],
  'bolsa-6l': colors.green[500],
  botellon: colors.yellow[500],
  'hielo-5kg': colors.orange[500],
  'botellon-nuevo': colors.indigo[500],
  'hielo-2kg': colors.purple[500],
  'barra-hielo': colors.pink[500],
} as Record<string, string>

type StyledCardProps = { colorKey: string } & { theme: Theme }
const StyledCard = styled(Card)(({ colorKey, theme }: StyledCardProps) => ({
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  borderLeftColor: colorMap[colorKey] ?? theme.palette.grey,
}))
