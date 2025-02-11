import Grid, { GridProps as MuiGridProps } from '@mui/material/Grid'
import {
  Formik,
  FormikConfig,
  FormikProps,
  Form as FForm,
  FormikFormProps as FFormProps,
  FormikValues,
} from 'formik'

type GridProps = MuiGridProps<typeof FForm, FFormProps>

interface FormProps<Values> extends FormikConfig<Values> {
  gridProps?: GridProps
  children: React.ReactNode | ((formik: FormikProps<Values>) => React.ReactNode)
  className?: string
}

function Form<Values extends FormikValues = FormikValues>(props: FormProps<Values>): JSX.Element {
  const { gridProps, children, className, ...otherProps } = props
  return (
    <Formik {...otherProps}>
      {formik => (
        <Grid container spacing={2} component={FForm} className={className} {...gridProps}>
          {typeof children === 'function'
            ? children(formik)
            : children
          }
        </Grid>
      )}
    </Formik>
  )
}

export default Form
