import type { JSX } from 'react'
import { Paper, Typography as T } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Alert } from '@mui/material'
import { format, isSameDay, startOfDay } from 'date-fns'
import LoadingIndicator from '../../../components/LoadingIndicator'
import Title from '../../../components/Title'
import useFetch from '../../../hooks/useFetch'
import useSnackbar from '../../../hooks/useSnackbar'
import { money } from '../../../utils'
import { DateRange } from '../index'

interface DayMoneyWidgetProps {
  dateRange: DateRange
}

export const DayMoneyWidget = ({ dateRange }: DayMoneyWidgetProps): JSX.Element | null => {
  const { minDate, maxDate } = dateRange

  if (!isSameDay(minDate, maxDate))
    return null

  return (
    <section>
      <Title>Dinero del día</Title>
      <DayMoneyImpl date={startOfDay(minDate)} />
    </section>
  )
}

interface DayMoneyImplProps {
  date: Date
}

const DayMoneyImpl = ({ date }: DayMoneyImplProps) => {

  const [stats, { loading, error }] = useDayMoneyStats(date)

  if (loading || stats === null) return <LoadingIndicator />
  if (error) return <FetchError />

  const total =
    stats.cashSaleAmount
    - stats.spendingFromCashAmount
    + stats.paymentAmount

  return (
    <Content>
      <Descr title='Venta efectivo:'>{money(stats.cashSaleAmount)}</Descr>
      <Descr title='Salidas de dinero del día:'>{money(stats.spendingFromCashAmount)}</Descr>
      <Descr title='Pagos en planta:'>{money(stats.paymentAmount)}</Descr>
      <Descr title='Total:'>{money(total)}</Descr>
    </Content>
  )
}

const FetchError = () => (
  <Alert severity='error'>
    Error al obtener las estadísticas sobre el dinero del día
  </Alert>
)

interface DescrProps {
  title: React.ReactNode,
  children: React.ReactNode,
}
const Descr = ({ title, children }: DescrProps) => (
  <T variant='body2'>
    <strong>{title}</strong> {children}
  </T>
)

const Content = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}))

interface DayMoneyStats {
  cashSaleAmount: number,
  spendingFromCashAmount: number,
  paymentAmount: number,
  success: true
}
const useDayMoneyStats = (date: Date) => {
  const formatDay = (d: Date) => format(d, 'yyyy-MM-dd')
  const showSnackbar = useSnackbar()
  const url = `/api/analysis/${formatDay(date)}/day-money`
  const [data, loading, error] = useFetch<DayMoneyStats>(url, {
    showError: showSnackbar,
    name: 'estádisticas sobre el dinero del día',
  })

  return [data, { loading, error }] as const
}
