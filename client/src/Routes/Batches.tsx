import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardProps,
  Grid,
  Paper,
  Skeleton,
  SkeletonProps,
  Theme,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { FormikHelpers } from 'formik'
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
import { fetchJsonAuth, isErrorResponse, scrollToRef } from '../utils'
import useAuth from '../hooks/useAuth'
import { useBatchesPaginated } from '../hooks/api/useBatches'
import type { Batch } from '../models'
import { FC, RefObject, useRef, useState } from 'react'
import { Link, LinkProps } from 'react-router'
import Alert from '../components/Alert'
import Pagination from '../components/pagination'

const PAGE_SIZE = 50

const Batches = () => {
  const [offset, setOffset] = useState(0)
  const [batches, { refresh, error, loading, totalCount }] = useBatchesPaginated({
    limit: PAGE_SIZE,
    offset,
  }, { include: ['BatchCategory'] })
  const scrollTargetRef = useRef<HTMLDivElement>(null)

  // Handle filter change while on a high page number
  if (totalCount && offset > totalCount) {
    const page = Math.floor(totalCount / PAGE_SIZE)
    setOffset(page * PAGE_SIZE)
  }

  return (
    <Layout title='Lotes'>
      <Title>Crear Lote</Title>
      <CreateBatchForm refresh={refresh} />

      <div style={{ height: 0 }} ref={scrollTargetRef} />
      <Title>Lotes</Title>
      {loading && !batches && <BatchListSkeleton />}
      {error && <Alert type='error' message={`Error al cargar lotes: ${error.message}`} />}
      {!error && batches && totalCount !== undefined && (
        <BatchList
          batches={batches}
          totalCount={totalCount}
          offset={offset}
          setOffset={setOffset}
          loading={loading}
          scrollTargetRef={scrollTargetRef}
        />
      )}
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

  const handleSubmit = async (values: FormValues, _formikHelpers: FormikHelpers<FormValues>) => {
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
        gridProps={{ direction: 'row', sx: { alignItems: 'center' } }}
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
  batches: Batch[]
  totalCount: number
  offset: number
  setOffset: (x: number) => void
  loading: boolean
  scrollTargetRef: RefObject<HTMLDivElement | null>
}

const BatchList = ({ batches, loading, totalCount, offset, setOffset, scrollTargetRef }: BatchListProps) => {
  const renderPagination = () => (
    <Pagination
      limit={PAGE_SIZE}
      offset={offset}
      total={totalCount}
      onClick={(_, offset) => {
        setOffset(offset)
        scrollToRef(scrollTargetRef)
      }}
      disabled={loading}
    />
  )

  return (
    <>
      {renderPagination()}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {batches.map(b =>
          <BatchCard batch={b} key={String(b.id)} />,
        )}
      </Box>
      {renderPagination()}
    </>
  )
}

const BatchListSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <BatchCardSkeleton />
    <BatchCardSkeleton />
    <BatchCardSkeleton />
  </Box>
)

const BatchCard = ({ batch }: { batch: Batch }) => (
  <StyledCard colorKey={batch.BatchCategory?.code ?? ''} component={Link} to={`./${batch.id}`}>
    <CardHeader title={batch.code} />
    <CardContent>
      <Typography variant='body2'>
        Categoría: {batch.BatchCategory?.name}
      </Typography>
    </CardContent>
  </StyledCard>
)

const BatchCardSkeleton = () => (
  <StyledCard colorKey='' to=''>
    <CardHeader title={<ISkeleton width={200} height={72}/>} />
    <CardContent>
      <div><ISkeleton width={120} />{' '}<ISkeleton width={210} /></div>
    </CardContent>
  </StyledCard>
)

const ISkeleton = (props: SkeletonProps) => (
  <Skeleton sx={{ display: 'inline-block', height: 48 }}{...props} />
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

type StyledCardProps = CardProps & LinkProps & {
  colorKey: string
}

type StyledCardPropsWithTheme = StyledCardProps & { theme: Theme }

const StyledCard = styled(Card)(({ colorKey, theme }: StyledCardPropsWithTheme) => ({
  textDecoration: 'inherit',
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  borderLeftColor: colorMap[colorKey] ?? theme.palette.grey,
})) as FC<StyledCardProps>
