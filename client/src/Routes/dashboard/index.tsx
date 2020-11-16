import { Grid, GridProps, styled, Theme } from '@material-ui/core'
import * as React from 'react'
import { useState } from 'react'
import Layout from '../../components/Layout'
import adminOnly from '../../hoc/adminOnly'
import { DateFilter, GroupByOption, initialGroupBy } from './components/DateFilter'
import { startOfDay, endOfDay } from 'date-fns'
import { SalesWidget } from './components/SalesWidget'
import { ToolsWidget } from './components/ToolsWidget'

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
      <Grid container spacing={3}>
        <OrderGrid item xs={12} lg={4} order={{ lg: 1 }}>
          <ToolsWidget />
        </OrderGrid>
        <Grid item xs={12} lg={8}>
          <SalesWidget
            rangeDescr={rangeDescr}
            dateRange={dateRange}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}

export default adminOnly(Dashboard)

const DashboardLayout = styled(props => <Layout title='Tablero' {...props} />)(({ theme }) => ({
  paddingTop: theme.spacing(4),
}))


interface OrderGridProps {
  order?: {
    xs?: number
    sm?: number
    lg?: number
    xl?: number
  }
}

const OrderGrid = styled(
  ({ order, ...props }) => <Grid {...props} />
)<Theme, GridProps & OrderGridProps>(({ theme, order }) => ({
  order: order?.xs,
  [theme.breakpoints.up('sm')]: { order: order?.sm },
  [theme.breakpoints.up('lg')]: { order: order?.lg },
  [theme.breakpoints.up('lg')]: { order: order?.lg },
  [theme.breakpoints.up('xl')]: { order: order?.xl },
}))
