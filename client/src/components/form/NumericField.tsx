import { useField, useFormikContext } from 'formik'
import { NumericControl, NumericControlProps } from '../controls/NumericControl'

export type NumericFieldProps = Omit<NumericControlProps, 'value' | 'onChange'> & {
  name: string
}

export const NumericField = (props: NumericFieldProps): JSX.Element => {
  const { name, label, ...otherProps } = props

  const [field, meta] = useField(name)
  const { setFieldValue } = useFormikContext()

  return (
    <NumericControl
      id={field.name}
      value={field.value as number}
      name={field.name}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : undefined}
      label={label}
      onChange={(value) => setFieldValue(name, value)}
      fullWidth
      {...otherProps}
    />
  )
}


