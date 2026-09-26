import { useParams } from 'react-router'
import Layout from '../../components/Layout'
import { useBatch, useBatchSales } from '../../hooks/api/useBatches'
import { Card, CardContent, CardHeader, Skeleton, SkeletonProps, Typography } from '@mui/material'
import { VSpace } from '../../components/utils'
import { BatchWithCategory } from '../../models'
import { ErrorResponse, formatDateonly } from '../../utils'
import Title from '../../components/Title'
import { useUserFetch } from '../../hooks/useUser'
import useSnackbar from '../../hooks/useSnackbar'
import Sells from '../../components/Sells'

const BatchDetail = () => {
  const { id } = useParams()
  const idNum = Number(id)

  if (isNaN(idNum)) {
    return (
      <Layout title="Error">
        Error: El id del lote en la URL no es válido
      </Layout>
    )
  }

  return <BatchDetailImpl id={idNum} />
}
export default BatchDetail

const BatchDetailImpl = ({ id }: { id: number }) => {
  return (
    <Layout title='Detalle del lote'>
      <VSpace />
      <BatchCard id={id} />
      <BatchSales id={id} />
    </Layout>
  )
}

const BatchCard = ({ id }: { id: number }) => {
  const [batch, { loading, error }] = useBatch(id)
  return (
    <>
      {loading && <BatchCardSkeleton />}
      {error && (
        <Typography variant='body1'>
          Error al obtener detalles del lote
        </Typography>
      )}
      {!error && !loading && batch && <BatchCardPresentation batch={batch} />}
    </>
  )
}

type BatchCardPresentationProps = {
  batch: BatchWithCategory
}

const BatchCardPresentation = ({ batch }: BatchCardPresentationProps) => (
  <Card>
    <CardHeader title="Lote" />
    <CardContent>
      <div>Categoria: {batch.BatchCategory.name}</div>
      <div>Código: {batch.code}</div>
      <div>Fecha: {formatDateonly(batch.date)}</div>
      <div>Fecha de expiración: {formatDateonly(batch.expirationDate)}</div>
    </CardContent>
  </Card>
)

const BatchCardSkeleton = () => (
  <Card>
    <CardHeader title="Lote" />
    <CardContent>
      <div><ISkeleton width={120} />{' '}<ISkeleton width={210} /></div>
      <div><ISkeleton width={150} />{' '}<ISkeleton width={150} /></div>
      <div><ISkeleton width={130} />{' '}<ISkeleton width={230} /></div>
    </CardContent>
  </Card>
)

const ISkeleton = (props: SkeletonProps) => (
  <Skeleton sx={{ display: 'inline-block', height: 48 }}{...props} />
)

const BatchSales = ({ id }: { id: number }) => {
  const [batchSales, { loading, error, update }] = useBatchSales(id)
  const showError = useSnackbar()
  const handleUserError = (error: ErrorResponse['error']) => {
    if (error.code === 'no_user') {
      // ignore not logged in
      return
    }
    showError(`Error al cargar el usuario actual: ${error.message}`)
  }

  const { isAdmin } = useUserFetch(handleUserError)
  const enableDelete = Boolean(isAdmin)

  return (
    <>
      <Title>Ventas</Title>
      {loading && (
        <Typography variant='body1'>
          Cargando ventas...
        </Typography>
      )}
      {error && (
        <Typography variant='body1'>
          Error al obtener detalles del lote
        </Typography>
      )}
      {!loading && !error && batchSales && (
        <Sells
          sells={batchSales}
          refresh={update}
          disableDelete={!enableDelete}
          disableWarnings
        />
      )}
    </>
  )
}
