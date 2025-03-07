import { Box, CardContent, Skeleton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Layout from '../components/Layout'
import { useCreditBalance } from '../hooks/api/useCreditBalance'
import { MakeRequired } from '../utils/types'
import { CreditBalanceItem } from '../models'
import { formatDateCol, money, moneySign } from '../utils'
import BorderedCard from '../components/BorderedCard'
import { VSpace } from '../components/utils'
import CardHeader from '../components/CardHeader'
import { blue } from '@mui/material/colors'
import { useNavigate } from 'react-router'
import { useCallback, useState } from 'react'
import SelectControl from '../components/controls/SelectControl'

type Item = MakeRequired<CreditBalanceItem, 'Client'>

const CreditBalance = () => {
  const [orderBy, setOrderBy] = useState<OrderBy>('balance-desc')

  const [items, { loading, error }] = useCreditBalance<Item>({
    params: {
      include: ['Client'],
      ...orderByMapping[orderBy],
    },
  })


  return (
    <Layout title="Balance Crédito">
      <VSpace />
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Box sx={{ minWidth: '300px' }}>
          <OrderBySelect value={orderBy} onChange={setOrderBy} />
        </Box>
      </Box>
      <VSpace />
      <CardsWrapper>
        {loading && (<>
          <BalanceItemSkeleton />
          <BalanceItemSkeleton />
          <BalanceItemSkeleton />
        </>)}
        {items?.map(item => (
          <BalanceItem key={item.clientId} item={item} />
        )) ?? null}
      </CardsWrapper>
    </Layout >
  )
}
export default CreditBalance


type OrderBy = keyof typeof orderByMapping

type OrderBySelectProps = {
  value: OrderBy
  onChange: (value: OrderBy) => void
}

const OrderBySelect = ({ value, onChange }: OrderBySelectProps) => {
  return (
    <SelectControl
      label='Ordenar por'
      options={orderByOptions}
      emptyOption={false}
      value={value}
      onChange={e => {
        onChange(e.target.value as OrderBy)
      }}
    />
  )
}

const orderByOptions = [
  { value: 'balance-desc', label: 'Saldo' },
  { value: 'name-asc', label: 'Cliente' },
  { value: 'date-desc', label: 'Última venta' },
] as const

const orderByMapping = {
  'balance-desc': { sortBy: 'balance', sortDir: 'desc' },
  'name-asc': { sortBy: 'clientName', sortDir: 'asc' },
  'date-desc': { sortBy: 'lastSaleDate', sortDir: 'desc' },
} as const

const BalanceItem = ({ item }: { item: Item }) => {
  const navigate = useNavigate()

  const goToBalance = useCallback(() => {
    navigate(`/clients/${item.clientId}/balance`)
  }, [item.clientId, navigate])

  return (
    <BorderedCard sx={{ cursor: 'pointer' }} onClick={goToBalance} >
      <CardHeader title={item.Client.name} sx={{ color: blue[800], textDecoration: 'underline' }} />
      <BalanceContent>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant='body1'>Ventas posfechado: {money(item.totalSales)}</Typography>
          <Typography variant='body1'>Pagos: {money(item.totalPayments)}</Typography>
          {item.lastSaleDate && (
            <Typography variant='body1'>Ultima venta: {formatDateCol(item.lastSaleDate)}</Typography>
          )}
        </CardContent>
        <Balance value={item.balance} />
      </BalanceContent>
    </BorderedCard>
  )
}

const BalanceContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}))

const Balance = ({ value }: { value: number }) => (
  <BalanceContainer>
    <BalanceHeader variant='overline'>
      Saldo
    </BalanceHeader>
    <BalanceValue variant='caption'>
      {moneySign(value)}
    </BalanceValue>
  </BalanceContainer>
)

const BalanceContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: blue[200],

  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    width: '300px',
  },
}))

const BalanceHeader = styled(Typography)({
  color: 'rgba(0, 0, 0, 0.75)',
  fontSize: '0.7rem',
  lineHeight: '0.77rem',
})

const BalanceValue = styled(Typography)({
  flex: '1',
  fontSize: '1.75rem',
  lineHeight: '3.5rem',
  paddingLeft: '2rem',
  paddingRight: '2rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

const BalanceItemSkeleton = () => (
  <BorderedCard>
    <CardHeader title={<><Skeleton /></>} />
    <BalanceContent>
      <CardContent sx={{ flex: 1 }}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </CardContent>
      <BalanceContainer>
        <BalanceHeader />
        <BalanceValue>
          <Skeleton width={100} />
        </BalanceValue>
      </BalanceContainer>
    </BalanceContent>
  </BorderedCard>
)

const CardsWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})
