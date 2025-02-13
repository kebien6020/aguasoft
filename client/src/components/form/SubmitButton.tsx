import type { JSX } from 'react'
import { CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useFormikContext } from 'formik'

export type SubmitButtonProps = {
  children?: React.ReactNode
  onlyEnableWhenValid?: boolean
  disabled?: boolean
}

const SubmitButton = ({ children, onlyEnableWhenValid = false, disabled = false }: SubmitButtonProps): JSX.Element => {
  const { isSubmitting, isValid } = useFormikContext()

  return (
    <Grid item xs={12} container direction='row' justifyContent='center'>
      <Wrapper>
        <Button
          variant='contained'
          color='primary'
          type='submit'
          disabled={isSubmitting || (onlyEnableWhenValid && !isValid) || disabled}
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
