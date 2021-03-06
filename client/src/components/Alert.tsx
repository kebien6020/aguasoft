import * as React from 'react'

import {
  Card,
  CardContent,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import * as colors from '@material-ui/core/colors'

import ErrorIcon from '@material-ui/icons/ErrorOutlined'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'
import clsx from 'clsx'


interface AlertProps {
  type: 'error' | 'warning' | 'success'
  message: string
}

const Alert = (props: AlertProps): JSX.Element => {
  const classes = useStyles()
  const cardClass = clsx(classes.alert, classes[props.type])
  return (
    <Card className={cardClass}>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.typography}>
          {props.type === 'error' && <ErrorIcon />}
          {props.type === 'warning' && <WarningIcon />}
          {props.type === 'success' && <InfoIcon />}
          {props.message}
        </Typography>
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles({
  alert: {
    padding: '8px',
    margin: '0.5rem 0 1rem',
    '& p': {
      fontSize: '1rem',
    },
  },
  cardContent: {
    padding: '0 !important',
  },
  typography: {
    // Vertical center
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    backgroundColor: colors.red[100],
    '& p': {
      color: colors.red[900],
    },
  },
  warning: {
    backgroundColor: colors.yellow[100],
    '& p': {
      color: colors.yellow[900],
    },
  },
  success: {
    backgroundColor: colors.green[100],
    '& p': {
      color: colors.green[900],
    },
  },
})

export default Alert
