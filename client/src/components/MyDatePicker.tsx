import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import DatePicker from 'material-ui-pickers/DatePicker'
import { isSameDay } from 'date-fns'

type DateChangeHandler = (date: Date) => any

interface MyDatePickerProps {
  date: Date
  onDateChange: DateChangeHandler
}

type MyDatePickerPropsAll = MyDatePickerProps & PropClasses

const MyDatePicker = (props : MyDatePickerPropsAll) => (
  <div className={props.classes.datePickerContainer}>

    {/*
    // @ts-ignore */}
    <DatePicker
      className={props.classes.datePicker}
      value={props.date}
      format='d-MMM-yyyy'
      disableFuture
      onChange={(date) => handleDateChange(date, props.date, props.onDateChange)}
    />
  </div>
)

function handleDateChange(
  date: Date,
  previousDate: Date,
  onDateChange: DateChangeHandler)
{
  // Ignore change when same day is selected
  if (!isSameDay(date, previousDate)) {
    onDateChange(date)
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  datePickerContainer: {
    display: 'block',
    textAlign: 'center',
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 2,
  },
  datePicker: {
    '& input': {
      textAlign: 'center',
    },
  },
})

export default withStyles(styles)(MyDatePicker)
