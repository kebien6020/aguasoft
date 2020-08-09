import * as React from 'react'
import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { useFormikContext } from 'formik'

const SubmitButton = (): JSX.Element => {
  const classes = useSubmitButtonStyles()
  const { isSubmitting } = useFormikContext()

  return (
    <Grid item xs={12}>
      <Button
        variant='contained'
        color='primary'
        type='submit'
        className={classes.button}
        disabled={isSubmitting}
      >
        Registrar
      </Button>
    </Grid>
  )
}

const useSubmitButtonStyles = makeStyles({
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
})

export default SubmitButton
