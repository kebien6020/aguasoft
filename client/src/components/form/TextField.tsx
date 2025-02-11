import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField'
import makeStyles from '@mui/styles/makeStyles'
import { useField, FieldInputProps, FieldMetaProps } from 'formik'

interface ChangeOverrideBag {
  field: FieldInputProps<string>
  meta: FieldMetaProps<string>
}

export type TextFieldProps = MuiTextFieldProps & {
  name: string
  label: React.ReactNode
  onChangeOverride?:
  (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>,
    bag: ChangeOverrideBag
  ) => unknown
}

const TextField = (props: TextFieldProps): JSX.Element => {
  const {
    label,
    name,
    onChangeOverride,
    ...otherProps
  } = props
  const classes = useStyles()

  const [field, meta] = useField(name)

  return (
    <MuiTextField
      id={field.name}
      className={classes.textfield}
      error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error ? meta.error : undefined}
      label={label}
      variant='standard'
      {...field}
      {...otherProps}
      onChange={(e) => {
        if (onChangeOverride)
          onChangeOverride(e, { field, meta })
        else
          field.onChange(e)

      }}
    />
  )
}

const useStyles = makeStyles(() => ({
  textfield: {
    minWidth: 150,
    width: '100%',
  },
}))

export default TextField
