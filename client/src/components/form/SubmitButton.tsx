import * as React from 'react'
import { CircularProgress, styled } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { useFormikContext } from 'formik'

export type SubmitButtonProps = {children: React.ReactNode}
const SubmitButton = ({ children }: SubmitButtonProps): JSX.Element => {
  const { isSubmitting } = useFormikContext()

  return (
    <Grid item xs={12} container direction='row' justify='center'>
      <Wrapper>
        <Button
          variant='contained'
          color='primary'
          type='submit'
          disabled={isSubmitting}
        >
          {children ?? 'Registrar'}
        </Button>
        {isSubmitting && <StyledProgress size={24} />}
      </Wrapper>
    </Grid>
  )
}
export default SubmitButton

const Wrapper = styled('div')({
  position: 'relative',
})

const StyledProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  position: 'absolute',
  top: 'calc(50% - 12px)',
  left: 'calc(50% - 12px)',
}))
