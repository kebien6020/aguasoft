import { useField } from 'formik'
import PriceInput, { PriceFieldProps as PriceInputProps } from '../PriceField'

type PriceFieldProps = PriceInputProps & {
  name: string
}
export const PriceField = (props: PriceFieldProps): JSX.Element => {
  const [field, meta, { setValue }] = useField<string>(props)
  return (
    <PriceInput
      value={field.value}
      onChange={({ target: { value } }) => setValue(value)}
      {...props}
      TextFieldProps={{
        name: field.name,
        onBlur: field.onBlur,
        error: Boolean(meta.touched && meta.error),
        ...props.TextFieldProps,
        helperText: meta.touched && meta.error
          ? meta.error
          : props.TextFieldProps?.helperText,
      }}
    />
  )
}
