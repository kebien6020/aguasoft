import type { ComponentType, JSX } from 'react'
import type {
  ReactNode,
  ChangeEvent,
  ChangeEventHandler,
  TextareaHTMLAttributes,
  ForwardedRef,
} from 'react'
import { forwardRef } from 'react'
import { InputBaseComponentProps, TextField } from '@mui/material'
import { TextFieldProps } from '@mui/material/TextField'

import { NumberFormatValues, NumericFormat, NumericFormatProps } from 'react-number-format'

interface NumFormatProps extends NumericFormatProps {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

const NumberFormatCustom = forwardRef((props: NumFormatProps, ref: ForwardedRef<HTMLInputElement>) => {
  const { onChange, ...other } = props

  return (

    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator='.'
      decimalSeparator=','
      prefix='$'
      onValueChange={({ value }: NumberFormatValues) => {
        onChange?.({
          target: {
            value: value,
          },
        } as ChangeEvent<HTMLInputElement>)
      }}
      decimalScale={4}
      valueIsNumericString
    />
  )
})
NumberFormatCustom.displayName = 'NumberFormatCustom'

export interface PriceFieldProps {
  label?: ReactNode
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  value?: TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>['value']
  TextFieldProps?: TextFieldProps
}

const PriceField = (props: PriceFieldProps): JSX.Element => (
  <TextField
    label={props.label}
    margin='normal'
    fullWidth
    slotProps={{
      input: {
        // Force the type here because the difference is on the
        // prop `defaultValue`, which we are not using here
        inputComponent: NumberFormatCustom as unknown as ComponentType<InputBaseComponentProps>,
      },
    }}
    onChange={props.onChange}
    value={props.value}
    {...props.TextFieldProps}
  />
)

export default PriceField
