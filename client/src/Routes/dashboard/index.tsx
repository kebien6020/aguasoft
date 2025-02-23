import type { FC, JSX } from 'react'
import { Grid2 as Grid, Grid2Props as GridProps, Theme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { endOfDay, startOfDay } from 'date-fns'
import { useState } from 'react'
import Layout from '../../components/Layout'
import { DateFilter, GroupByOption, initialGroupBy } from './components/DateFilter'
import { DayMoneyWidget } from './components/DayMoneyWidget'
import { SalesWidget } from './components/SalesWidget'
import { ToolsWidget } from './components/ToolsWidget'
import { DamageWidget } from './components/DamageWidget'

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
    <DashboardLayout title='Tablero'>
      <DateFilter
        onRangeChange={setDateRange}
        onGroupByChange={setGroupBy}
      />
      <Grid container spacing={3}>
        <OrderGrid size={{ xs: 12, lg: 4 }} order={{ lg: 1 }}>
          <ToolsWidget />
        </OrderGrid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <DayMoneyWidget
            dateRange={dateRange}
          />
          <SalesWidget
            rangeDescr={rangeDescr}
            dateRange={dateRange}
          />
          <DamageWidget dateRange={dateRange} />
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}

export default Dashboard

const DashboardLayout = styled(Layout)(({ theme }) => ({
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
  (props) => <Grid {...props} />,
  { shouldForwardProp: (prop) => prop !== 'order' },
)(({ theme, order }: OrderGridProps & { theme: Theme }) => ({
  order: order?.xs,
  [theme.breakpoints.up('sm')]: { order: order?.sm },
  [theme.breakpoints.up('lg')]: { order: order?.lg },
  [theme.breakpoints.up('lg')]: { order: order?.lg },
  [theme.breakpoints.up('xl')]: { order: order?.xl },
})) as FC<GridProps & OrderGridProps>
