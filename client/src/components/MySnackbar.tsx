import { useState, useCallback, forwardRef } from 'react'
import type { JSX } from 'react'
import clsx from 'clsx'
import makeStyles from '@mui/styles/makeStyles'

import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import SnackbarContent from '@mui/material/SnackbarContent'

import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import { Theme } from '../theme'

export interface ErrorSnackbarProps {
  className?: string
  message?: string
  onClose?: () => void
}

export const ErrorSnackbar = forwardRef((props: ErrorSnackbarProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const classes = useErrorSnackbarStyles()
  const { className, message, onClose, ...other } = props

  return (
    (<SnackbarContent
      className={clsx('cont', className)}
      aria-describedby='client-snackbar'
      message={
        <span id='client-snackbar' className={classes.message}>
          <ErrorIcon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key='close'
          aria-label='close'
          color='inherit'
          onClick={onClose}
          size="large">
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      ref={ref}
      {...other}
    />)
  )
})
ErrorSnackbar.displayName = 'ErrorSnackbar'

const useErrorSnackbarStyles = makeStyles((theme: Theme) => ({
  cont: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}))

const anchor = {
  vertical: 'bottom',
  horizontal: 'center',
} as const

export function useSnackbar(): [JSX.Element, React.Dispatch<React.SetStateAction<string | null>>] {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const snackbarOpen = snackbarMessage !== null
  const handleSnackbarClose = useCallback(() => {
    setSnackbarMessage(null) 
  }, [])
  const snackbar =
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={5000}
      onClose={handleSnackbarClose}
      anchorOrigin={anchor}
    >
      <ErrorSnackbar message={snackbarMessage || undefined} onClose={handleSnackbarClose} />
    </Snackbar>

  return [snackbar, setSnackbarMessage]
}
