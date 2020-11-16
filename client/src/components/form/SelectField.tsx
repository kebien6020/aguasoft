import * as React from 'react'
import { useField, FieldInputProps, FieldMetaProps } from 'formik'
import SelectControl, { SelectControlProps } from '../controls/SelectControl'

export interface SelectOption {
  value: string
  label: React.ReactNode
}

interface ChangeOverrideBag {
  field: FieldInputProps<string>
  meta: FieldMetaProps<string>
}

export interface SelectFieldProps extends SelectControlProps {
  name: string
  onChangeOverride?:
    (
      event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>,
      bag: ChangeOverrideBag
    ) => unknown
  onBeforeChange?: (value: string) => boolean | void
}

const SelectField = (props: SelectFieldProps): JSX.Element => {
  const {
    name,
    onChangeOverride,
    onBeforeChange = () => { /**/ },
    ...otherProps
  } = props
  const [field, meta] = useField(name)
  return (
    <SelectControl
      {...field}
      id={field.name}
      errorMessage={meta.error}
      touched={meta.touched}
      onChange={(e) => {
        const continueChange = onBeforeChange(e.target.value as string)
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
