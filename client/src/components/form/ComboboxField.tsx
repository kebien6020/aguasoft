import {
  Autocomplete,
  AutocompleteProps,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
} from '@mui/material'
import { useField, useFormikContext } from 'formik'

export type ComboboxOption = {
  label: string
  value: string
}

export type ComboboxFieldProps =
  Omit<AutocompleteProps<ComboboxOption, false, false, false>, 'options' | 'renderInput'> & {
    name: string
    label: string
    options?: readonly ComboboxOption[] | null
    emptyOption?: string
  }

export const ComboboxField = (props: ComboboxFieldProps) => {
  const {
    name,
    label,
    options,
    emptyOption = props.options === null ? 'Cargando…' : 'Seleccionar',
    ...otherProps
  } = props

  const [field, meta] = useField<string>(name)
  const { setFieldValue } = useFormikContext()
  const value = options?.find(o => o.value === field.value) ?? null

  const optionsWithFallback = options ?? [{ label: emptyOption, value: '' }]

  const handleChange = (_event: unknown, newValue: ComboboxOption | null) => {
    setFieldValue(name, newValue?.value ?? '')
  }

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onBlur={field.onBlur}
      id={field.name}
      options={optionsWithFallback}
      renderInput={params =>
        <TextField
          {...params}
          label={label}
          name={field.name}
          error={Boolean(meta.touched && meta.error)}
          helperText={meta.touched && meta.error ? meta.error : undefined}
          variant='standard'
        />
      }
      {...otherProps}
    />
  )
}
