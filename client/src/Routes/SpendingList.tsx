import { useCallback, useState } from 'react'
import { styled } from '@mui/material/styles'

import Pagination from '../components/pagination'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import ResponsiveContainer from '../components/ResponsiveContainer'
import Spendings from '../components/Spendings'
import adminOnly from '../hoc/adminOnly'
import { fetchJsonAuth, isErrorResponse, SuccessResponse } from '../utils'
import { useSpendingsPaginated } from '../hooks/api/useSpendings'
import useSnackbar from '../hooks/useSnackbar'
import useAuth from '../hooks/useAuth'

const ITEMS_PER_PAGE = 30

const SpendingList = () => {
  const showError = useSnackbar()
  const auth = useAuth()

  const [offset, setOffset] = useState(0)

  const [data, { loading, update }] = useSpendingsPaginated({
    limit: ITEMS_PER_PAGE,
    offset,
  })
  const disablePagination = loading
  const totalCount = data?.totalCount ?? 0
  const spendings = data?.spendings


  const handlePageChange = useCallback(async (_event: unknown, offset: number) => {
    setOffset(offset)
  }, [])

  const pagination = (
    <StyledPagination
      limit={ITEMS_PER_PAGE}
      offset={offset}
      total={totalCount}
      onClick={handlePageChange}
      disabled={disablePagination}
    />
  )

  const handleDeleteSpending = async (spendingId: number) => {
    if (!spendings) return

    const result = await fetchJsonAuth<SuccessResponse>(`/api/spendings/${spendingId}`, auth, {
      method: 'delete',
    })

    if (isErrorResponse(result)) {
      console.error(result.error)
      showError('Error al intentar eliminar la salida: ' + result.error.message)
      return
    }

    update()
  }

  if (spendings === undefined)
    return <LoadingScreen text='Cargando salidas...' />

  return (
    <Layout title='Lista de salidas'>
      <ResponsiveContainer>
        {pagination}
        <Spendings
          spendings={spendings}
          onDeleteSpending={handleDeleteSpending}
        />
        {pagination}
      </ResponsiveContainer>
    </Layout>
  )
}

const StyledPagination = styled(Pagination)({
  textAlign: 'center',
})

export default adminOnly(SpendingList)
