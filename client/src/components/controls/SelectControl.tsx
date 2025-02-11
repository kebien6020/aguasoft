import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import makeStyles from '@mui/styles/makeStyles'

export interface SelectOption {
  value: string
  label: React.ReactNode
}

export interface SelectControlProps extends SelectProps {
  name?: string
  label: React.ReactNode
  emptyOption?: React.ReactNode
  options?: readonly SelectOption[] | null
  helperText?: React.ReactNode
  touched?: boolean
  errorMessage?: string
}

const SelectControl = (props: SelectControlProps): JSX.Element => {
  const {
    label,
    options,
    emptyOption = options === null ? 'Cargando…' : 'Seleccionar',
    helperText,
    errorMessage,
    touched,
    id,
    ...otherProps
  } = props
  const classes = useStyles()
  return (
    <FormControl className={classes.formControl} variant='standard' error={Boolean(errorMessage && touched)}>
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
