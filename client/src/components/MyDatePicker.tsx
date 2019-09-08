import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import { DatePicker, DatePickerProps } from '@material-ui/pickers/DatePicker'
import * as moment from 'moment'

type DateChangeHandler = (date: moment.Moment) => any

interface MyDatePickerProps {
  label?: React.ReactNode
  date: moment.Moment
  onDateChange: DateChangeHandler
  DatePickerProps?: Partial<DatePickerProps>
  className?: string
}

type MyDatePickerPropsAll = MyDatePickerProps & PropClasses

const MyDatePicker = (props : MyDatePickerPropsAll) => (
  <div className={[props.classes.datePickerContainer, props.className].join(' ')}>

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
  date: moment.Moment | null,
  previousDate: moment.Moment,
  onDateChange: DateChangeHandler)
{
  date = date ? date : moment.invalid()
  // Ignore change when same day is selected
  if (!date.isSame(previousDate, 'day')) {
    onDateChange(date)
  }
}

const styles: StyleRulesCallback<Theme, MyDatePickerProps> = theme => ({
  datePickerContainer: {
    display: 'block',
    textAlign: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  datePicker: {
    '& input': {
      textAlign: 'center',
    },
  },
})

export default withStyles(styles)(MyDatePicker)
