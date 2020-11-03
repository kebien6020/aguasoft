import { styled } from '@material-ui/core'
import * as React from 'react'
import { useState } from 'react'
import Layout from '../../components/Layout'
import adminOnly from '../../hoc/adminOnly'
import { DateFilter, GroupByOption, initialGroupBy } from './components/DateFilter'
import { startOfDay, endOfDay } from 'date-fns'
import { SalesWidget } from './components/SalesWidget'

export type DateRange = {
  minDate: Date
  maxDate: Date
}

const Dashboard = (): JSX.Element => {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    minDate: startOfDay(new Date),
    maxDate: endOfDay(new Date),
  }))
  const [groupBy, setGroupBy] = useState<GroupByOption>(initialGroupBy)
  const rangeDescr = groupBy === 'day' ? 'Día' : 'Mes'

  return (
    <DashboardLayout>
      <DateFilter
        onRangeChange={setDateRange}
        onGroupByChange={setGroupBy}
      />
      <SalesWidget
        rangeDescr={rangeDescr}
        dateRange={dateRange}
      />
    </DashboardLayout>
  )
}

export default adminOnly(Dashboard)

const DashboardLayout = styled(props => <Layout title='Tablero' {...props} />)(({ theme }) => ({
  paddingTop: theme.spacing(4),
}))


