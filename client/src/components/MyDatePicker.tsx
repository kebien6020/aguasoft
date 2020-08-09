import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { DatePicker, DatePickerProps } from '@material-ui/pickers/DatePicker'
import * as moment from 'moment'

type DateChangeHandler = (date: moment.Moment) => unknown

interface MyDatePickerProps {
  label?: React.ReactNode
  date: moment.Moment | null
  onDateChange: DateChangeHandler
  DatePickerProps?: Partial<DatePickerProps>
  className?: string
}

const MyDatePicker = (props : MyDatePickerProps): JSX.Element => {
  const classes = useStyles()
  return (
    <div className={[classes.datePickerContainer, props.className].join(' ')}>

      <DatePicker
        label={props.label}
        className={classes.datePicker}
        value={props.date}
        format='DD-MMM-YYYY'
        disableFuture
        onChange={(date) => handleDateChange(date, props.onDateChange)}
        {...props.DatePickerProps}
      />
    </div>
  )
}

function handleDateChange(
  date: moment.Moment | null,
  onDateChange: DateChangeHandler
) {
  date = date ? date : moment.invalid()
  onDateChange(date)
}

const useStyles = makeStyles(theme => ({
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
}))

export default MyDatePicker
