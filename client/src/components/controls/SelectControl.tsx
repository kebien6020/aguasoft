import * as React from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select, { SelectProps } from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'

export interface SelectOption {
  value: string
  label: React.ReactNode
}

export interface SelectControlProps extends SelectProps {
  name?: string
  label: React.ReactNode
  emptyOption?: React.ReactNode
  options?: SelectOption[] | null
  helperText?: React.ReactNode
  touched?: boolean
  errorMessage?: string
}

const SelectControl = (props: SelectControlProps): JSX.Element => {
  const {
    label,
    options,
    emptyOption,
    helperText,
    errorMessage,
    touched,
    id,
    ...otherProps
  } = props
  const classes = useStyles()
  return (
    <FormControl className={classes.formControl} error={Boolean(errorMessage && touched)}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Select
        id={id}
        {...otherProps}
      >
        {emptyOption
          && <MenuItem value=''>{emptyOption}</MenuItem>
        }
        {options && options.map(o =>
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        )}
      </Select>
      {(errorMessage && touched || helperText)
        && <FormHelperText>{errorMessage || helperText}</FormHelperText>
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

export default SelectControl
