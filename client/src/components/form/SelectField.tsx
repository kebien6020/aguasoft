import type { JSX } from 'react'
import { useField, FieldInputProps, FieldMetaProps } from 'formik'
import SelectControl, { SelectControlProps } from '../controls/SelectControl'

export interface SelectOption {
  value: string
  label: React.ReactNode
}

export type ChangeEvent = { target: { name?: string | undefined; value: unknown; } }

export interface ChangeOverrideBag {
  field: FieldInputProps<string>
  meta: FieldMetaProps<string>
}

export type SelectFieldProps = SelectControlProps & {
  name: string
  onChangeOverride?:
  (
    event: ChangeEvent,
    bag: ChangeOverrideBag
  ) => unknown
  onBeforeChange?: (value: string) => boolean | undefined
}

const SelectField = (props: SelectFieldProps): JSX.Element => {
  const {
    name,
    onChangeOverride,
    onBeforeChange = () => { /* */ },
    ...otherProps
  } = props
  const [field, meta] = useField<string>(name)
  return (
    <SelectControl
      {...field}
      id={field.name}
      errorMessage={meta.error}
      touched={meta.touched}
      onChange={(e: ChangeEvent) => {
        if (typeof e.target.value !== 'string') {
          console.warn('SelectField onChange received non-string value', e.target.value)
          return
        }

        const continueChange = onBeforeChange(e.target.value)
        if (continueChange === false) return

        if (onChangeOverride)
          onChangeOverride(e, { field, meta })
        else
          field.onChange(e)

      }}
      {...otherProps}
    />
  )
}

export default SelectField
