import * as React from 'react'
import { useState, useCallback } from 'react'
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles'

import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'

import ErrorIcon from '@material-ui/icons/Error'
import CloseIcon from '@material-ui/icons/Close'

export interface ErrorSnackbarProps {
  className?: string
  message?: string
  onClose?: () => void
}

export function ErrorSnackbar(props: ErrorSnackbarProps) {
  const classes = useErrorSnackbarStyles()
  const { className, message, onClose, ...other } = props

  return (
    <SnackbarContent
      className={clsx('cont', className)}
      aria-describedby='client-snackbar'
      message={
        <span id='client-snackbar' className={classes.message}>
          <ErrorIcon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key='close' aria-label='close' color='inherit' onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  )
}

const useErrorSnackbarStyles = makeStyles(theme => ({
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

export function useSnackbar() {
  const [snackbarMessage, setSnackbarMessage] = useState<string|null>(null)
  const snackbarOpen = snackbarMessage !== null;
  const handleSnackbarClose = useCallback(() => setSnackbarMessage(null), []);
  const snackbar =
    <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
      <ErrorSnackbar message={snackbarMessage || undefined} onClose={handleSnackbarClose} />
    </Snackbar>

  return [snackbar, setSnackbarMessage] as [typeof snackbar, typeof setSnackbarMessage]
}
