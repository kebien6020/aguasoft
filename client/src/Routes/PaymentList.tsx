import { useCallback, useState } from 'react'
import { styled } from '@mui/material/styles'

import adminOnly from '../hoc/adminOnly'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import Payments from '../components/Payments'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { fetchJsonAuth, SuccessResponse, isErrorResponse } from '../utils'
import Pagination from '../components/pagination'
import useAuth from '../hooks/useAuth'
import { usePaymentsPaginated } from '../hooks/api/usePayments'
import useSnackbar from '../hooks/useSnackbar'

const ITEMS_PER_PAGE = 30

const PaymentList = () => {
  const auth = useAuth()
  const showError = useSnackbar()

  const [offset, setOffset] = useState(0)

  const [data, { loading, update }] = usePaymentsPaginated({
    limit: ITEMS_PER_PAGE,
    offset,
  })

  const payments = data?.payments
  const totalCount = data?.totalCount

  const handlePageChange = useCallback((_event: unknown, offset: number) => {
    setOffset(offset)
  }, [])

  const handleDeletePayment = async (paymentId: number) => {
    if (!payments) return

    const result =
      await fetchJsonAuth<SuccessResponse>(`/api/payments/${paymentId}`, auth, {
        method: 'delete',
      })

    if (isErrorResponse(result)) {
      showError('Error eliminando pago: ' + result.error.message)
      return
    }

    update()
  }

  const pagination = (
    <StyledPagination
      limit={ITEMS_PER_PAGE}
      offset={offset}
      total={totalCount ?? 0}
      disabled={loading}
      onClick={handlePageChange}
    />
  )

  if (payments === undefined)
    return <LoadingScreen text='Cargando pagos...' />


  return (
    <Layout title='Todos los Pagos' container={ResponsiveContainer}>
      {pagination}
      <Payments
        payments={payments}
        onDeletePayment={handleDeletePayment}
      />
      {pagination}
    </Layout>
  )
}

const StyledPagination = styled(Pagination)({
  textAlign: 'center',
})

export default adminOnly(PaymentList)
