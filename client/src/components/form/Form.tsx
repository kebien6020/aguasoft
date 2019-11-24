import * as React from 'react'
import Grid, { GridProps as MuiGridProps } from '@material-ui/core/Grid'
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
  children: React.ReactNode | ((formik: FormikProps<Values>) => any)
  className?: string
}

function Form<Values extends FormikValues = FormikValues>(props: FormProps<Values>) {
  const { gridProps, children, className, ...otherProps } = props
  return (
    <Formik {...otherProps}>
      {formik => (
        <Grid container spacing={2} component={FForm} className={className} {...gridProps}>
          {typeof children === 'function' ?
            children(formik) :
            children
          }
        </Grid>
      )}
    </Formik>
  )
}

export default Form
