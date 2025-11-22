import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import { MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers/MobileDatePicker'
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker'
import { Theme } from '../theme'
import clsx from 'clsx'
import { DatePickerFieldProps } from '@mui/x-date-pickers/DatePicker'
import { CalendarIcon, useParsedFormat, usePickerContext, useSplitFieldProps, useValidation, validateDate } from '@mui/x-date-pickers'
import TextField from '@mui/material/TextField'
import { format, isValid } from 'date-fns'

type DateChangeHandler = (date: Date) => unknown

const formatResilient = (date: Date | null, fieldFormat: string): string => {
  if (date && isValid(date))
    return format(date, fieldFormat)

  return ''
}

function ReadOnlyDateField(props: DatePickerFieldProps) {
  const { internalProps, forwardedProps } = useSplitFieldProps(props, 'date')

  const pickerContext = usePickerContext()
  const { value, fieldFormat } = pickerContext
  const formatted = formatResilient(value, fieldFormat)

  const parsedFormat = useParsedFormat()
  const { hasValidationError } = useValidation({
    validator: validateDate,
    value: pickerContext.value,
    timezone: pickerContext.timezone,
    props: internalProps,
  })

  return (
    <TextField
      {...forwardedProps}
      value={formatted}
      placeholder={parsedFormat}
      slotProps={{
        input: {
          ref: pickerContext.triggerRef,
          readOnly: true,
          endAdornment: <CalendarIcon color="action" />,
          sx: { cursor: 'pointer', '& *': { cursor: 'inherit' } },
        },
      }}
      error={hasValidationError}
      focused={pickerContext.open}
      onClick={() => {
        pickerContext.setOpen((prev) => !prev)
      }}
      name={pickerContext.name}
      label={pickerContext.label}
      className={pickerContext.rootClassName}
      sx={pickerContext.rootSx}
      ref={pickerContext.rootRef}
    />
  )
}

export interface MyDatePickerProps {
  label?: React.ReactNode
  date: Date | null
  onDateChange: DateChangeHandler
  DatePickerProps?: Partial<MobileDatePickerProps>
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
        onChange={(date) => {
          handleDateChange(date, props.onDateChange)
        }}
        slots={{
          field: ReadOnlyDateField,
        }}
        {...props.DatePickerProps}
      />
    </div>
  )
}

export interface ClearableDatePickerProps extends MyDatePickerProps {
  DatePickerProps?: Partial<DesktopDatePickerProps>
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
        onChange={(date) => {
          handleDateChange(date, props.onDateChange)
        }}
        slotProps={{
          ...slotProps,
          field: {
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
  onDateChange: DateChangeHandler,
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
