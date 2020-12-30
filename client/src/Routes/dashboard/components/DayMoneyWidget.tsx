import { Paper, styled, Typography as T } from '@material-ui/core'
import { isSameDay } from 'date-fns'
import React from 'react'
import Title from '../../../components/Title'
import { money } from '../../../utils'
import { DateRange } from '../index'

interface DayMoneyWidgetProps {
  dateRange: DateRange
}

export const DayMoneyWidget = ({ dateRange }: DayMoneyWidgetProps): React.ReactNode => {
  const { minDate, maxDate } = dateRange

  if (!isSameDay(minDate, maxDate))
    return null

  return (
    <section>
      <Title>Dinero del día</Title>

      <Content>
        <Descr title='Venta efectivo:'>{money(500000)}</Descr>
        <Descr title='Salidas de dinero del día:'>{money(-300000)}</Descr>
        <Descr title='Pagos:'>{money(80000)}</Descr>
        <Descr title='Total:'>{money(500000 - 300000 + 80000)}</Descr>
      </Content>
    </section>
  )
}

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
