import { styled } from '@material-ui/core'
import { useField } from 'formik'
import React from 'react'
import { MakeOptional } from '../../utils/types'
import MyDatePicker, { MyDatePickerProps } from '../MyDatePicker'

type DateFieldProps = MakeOptional<MyDatePickerProps, 'date' | 'onDateChange'> & {
  name: string
}
export const DateField = (props: DateFieldProps): JSX.Element => {
  const [field, meta, { setValue, setTouched }] = useField<Date>(props)

  return (
    <DatePicker
      date={field.value}
      onDateChange={momentDate => setValue(momentDate.toDate())}
      {...props}
      DatePickerProps={{
        error: Boolean(meta.touched && meta.error),
        helperText: meta.touched ? meta.error : undefined,
        onBlur: () => setTouched(true),
        fullWidth: true,
        margin: 'normal',
        ...props.DatePickerProps,
      }}
    />
  )
}

const DatePicker = styled(MyDatePicker)({
  marginTop: 0,
  marginBottom: 0,
})
