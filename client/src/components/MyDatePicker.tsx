import type { JSX } from 'react'
import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import { MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers/MobileDatePicker'
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker'
import { Theme } from '../theme'
import clsx from 'clsx'

type DateChangeHandler = (date: Date) => unknown

export interface MyDatePickerProps {
  label?: React.ReactNode
  date: Date | null
  onDateChange: DateChangeHandler
  DatePickerProps?: Partial<MobileDatePickerProps<Date>>
  className?: string
}

const MyDatePicker = (props: MyDatePickerProps): JSX.Element => {
  const classes = useStyles()
  return (
    <div className={clsx(classes.datePickerContainer, props.className)}>
      <MobileDatePicker
        label={props.label}
        className={classes.datePicker}
        value={props.date}
        format='dd-MMM-yyyy'
        disableFuture
        onChange={(date) => handleDateChange(date, props.onDateChange)}
        {...props.DatePickerProps}
      />
    </div>
  )
}

export interface ClearableDatePickerProps extends MyDatePickerProps {
  DatePickerProps?: Partial<DesktopDatePickerProps<Date>>
}

// For now this has to be separate as Mobile Date Picker does not support
// clearable
export const ClearableDatePicker = (props: ClearableDatePickerProps): JSX.Element => {
  const classes = useStyles()
  const { slotProps, ...rest } = props.DatePickerProps ?? {}
  return (
    <div className={clsx(classes.datePickerContainer, props.className)}>
      <DesktopDatePicker
        label={props.label}
        className={classes.datePicker}
        value={props.date}
        format='dd-MMM-yyyy'
        disableFuture
        onChange={(date) => handleDateChange(date, props.onDateChange)}
        slotProps={{
          ...slotProps,
          field: {
            ...slotProps?.field,
            clearable: true,
          },
        }}
        {...rest}
      />
    </div>
  )
}

function handleDateChange(
  date: Date | null,
  onDateChange: DateChangeHandler
) {
  date = date ? date : new Date(NaN)
  onDateChange(date)
}

const useStyles = makeStyles((theme: Theme) => ({
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
