import * as React from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select, {SelectProps} from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'
import { useField, FieldInputProps, FieldMetaProps } from 'formik'

interface SelectOption {
  value: string
  label: React.ReactNode
}

interface ChangeOverrideBag {
  field: FieldInputProps<string>
  meta: FieldMetaProps<string>
}

export interface SelectFieldProps extends SelectProps {
  name: string
  label: React.ReactNode
  emptyOption?: React.ReactNode
  options?: SelectOption[] | null
  onChangeOverride?: (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>, bag: ChangeOverrideBag) => any
}

const SelectField = (props: SelectFieldProps) => {
  const {
    label,
    name,
    options,
    emptyOption,
    onChangeOverride,
    ...otherProps
  } = props
  const classes = useStyles()
  const [ field, meta ] = useField(name)
  return (
    <FormControl className={classes.formControl} error={Boolean(meta.touched && meta.error)}>
      <InputLabel id={field.name}>{label}</InputLabel>
      <Select
        id={field.name}
        {...field}
        {...otherProps}
        onChange={(e) => {
          if (onChangeOverride) {
            onChangeOverride(e, {field, meta})
          } else {
            field.onChange(e)
          }
        }}
      >
        {emptyOption &&
          <MenuItem value=''>{emptyOption}</MenuItem>
        }
        {options && options.map(o =>
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        )}
      </Select>
      {meta.error && meta.touched &&
        <FormHelperText>{meta.error}</FormHelperText>
      }
    </FormControl>
  )
}

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 150,
    width: '100%',
  },
}))

export default SelectField
