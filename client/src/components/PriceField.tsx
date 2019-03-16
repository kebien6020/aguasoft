import * as React from 'react'

import { TextField } from '@material-ui/core'
import { TextFieldProps } from '@material-ui/core/TextField'

import * as NumberFormat from 'react-number-format'

type ValChangeEvent = { target: { value: string } }

interface NumFormatProps extends NumberFormat.NumberFormatProps {
  inputRef?: React.Ref<Element>
  onChange?: (event: ValChangeEvent) => void
}

function NumberFormatCustom(props: NumFormatProps) {
  const { inputRef, onChange, ...other } = props;

  return (

    // @ts-ignore Weird typing error requiring esModuleInterop in the tsconfig
    //            which breaks the rest of the code
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      thousandSeparator='.'
      decimalSeparator=','
      onValueChange={(values: any) => {
        if (!onChange) return
        onChange({
          target: {
            value: values.value,
          },
        });
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

const PriceField = (props: Props) => (
  <TextField
    label={props.label}
    margin='normal'
    fullWidth
    InputProps={{inputComponent: NumberFormatCustom}}
    onChange={props.onChange}
    value={props.value}

    {...props.TextFieldProps}
  />
)

export default PriceField
