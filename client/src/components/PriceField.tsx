import * as React from 'react'

import { TextField } from '@material-ui/core'
import { TextFieldProps } from '@material-ui/core/TextField'

import NumberFormat, { NumberFormatProps } from 'react-number-format'

interface NumFormatProps extends NumberFormatProps {
  inputRef?: React.Ref<Element>
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function NumberFormatCustom(props: NumFormatProps) {
  const { inputRef, onChange, ...other } = props

  return (

    <NumberFormat
      {...other}
      getInputRef={inputRef}
      thousandSeparator='.'
      decimalSeparator=','
      onValueChange={(values) => {
        if (!onChange) return
        onChange({
          target: {
            value: values.value,
          },
        } as React.ChangeEvent<HTMLInputElement>)
      }}
      prefix='$'
      decimalScale={4}
      isNumericString
    />
  )
}

interface Props {
  label?: React.ReactNode
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  value?: Array<string | number | boolean> | string | number | boolean
  TextFieldProps?: TextFieldProps
}

const PriceField = (props: Props): JSX.Element => (
  <TextField
    label={props.label}
    margin='normal'
    fullWidth
    InputProps={{ inputComponent: NumberFormatCustom }}
    onChange={props.onChange}
    value={props.value}
    {...props.TextFieldProps}
  />
)

export default PriceField
