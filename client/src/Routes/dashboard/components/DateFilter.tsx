import { FormControl, Grid, InputLabel, MenuItem, Select, styled } from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers/DatePicker'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from '../index'

export type GroupByOption = 'day' | 'month'


export type DateFilterProps = {
  onRangeChange: (range: DateRange) => unknown
  onGroupByChange: (groupBy: GroupByOption) => unknown
}

export const initialGroupBy = 'day' as GroupByOption

export const DateFilter = ({
  onRangeChange,
  onGroupByChange,
}: DateFilterProps): JSX.Element => {
  const [groupBy, setGroupBy] = useState<GroupByOption>('day')
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    if (groupBy === 'day') {
      onRangeChange({
        minDate: startOfDay(date),
        maxDate: endOfDay(date),
      })
      return
    }

    if (groupBy === 'month') {
      onRangeChange({
        minDate: startOfMonth(date),
        maxDate: endOfMonth(date),
      })
      return
    }
  }, [date, groupBy, onRangeChange])

  useEffect(() => {
    onGroupByChange(groupBy)
  }, [groupBy, onGroupByChange])

  return (
    <Grid container spacing={2} justify='center'>
      <Grid item>
        <FormControl>
          <InputLabel>Agrupar</InputLabel>
          <StyledSelect
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as GroupByOption)}
          >
            <MenuItem value='day'>Día</MenuItem>
            <MenuItem value='month'>Mes</MenuItem>
          </StyledSelect>
        </FormControl>
      </Grid>
      <Grid item>
        {groupBy === 'day' && <>
          <DatePicker
            label='Día'
            format='DD [de] MMMM'

            value={date}
            onChange={date => {
              if (!date) return
              setDate(date.toDate())
            }}
            disableFuture />
        </>}
        {groupBy === 'month' && <>
          <DatePicker
            label='Mes'
            views={['year', 'month']}
            format='MMMM YYYY'
            openTo='month'

            value={date}
            onChange={date => {
              if (!date) return
              setDate(date.startOf('month').toDate())
            }}
            disableFuture />
        </>}
      </Grid>
    </Grid>
  )
}

const StyledSelect = styled(Select)({
  minWidth: '7em',
})