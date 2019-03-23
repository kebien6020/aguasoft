import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import DatePicker from 'material-ui-pickers/DatePicker'
import { DatePickerProps } from 'material-ui-pickers/DatePicker'
import * as moment from 'moment'

type DateChangeHandler = (date: Date) => any

interface MyDatePickerProps {
  label?: React.ReactNode
  date: Date
  onDateChange: DateChangeHandler
  DatePickerProps?: Partial<DatePickerProps>
}

type MyDatePickerPropsAll = MyDatePickerProps & PropClasses

const MyDatePicker = (props : MyDatePickerPropsAll) => (
  <div className={props.classes.datePickerContainer}>

    {/*
    // @ts-ignore */}
    <DatePicker
      label={props.label}
      className={props.classes.datePicker}
      value={props.date}
      format='DD-MMM-YYYY'
      disableFuture
      onChange={(date) => handleDateChange(date, props.date, props.onDateChange)}
      {...props.DatePickerProps}
    />
  </div>
)

function handleDateChange(
  date: Date,
  previousDate: Date,
  onDateChange: DateChangeHandler)
{
  // Ignore change when same day is selected
  if (!moment(date).isSame(previousDate, 'day')) {
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
