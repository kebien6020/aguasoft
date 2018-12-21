import * as React from 'react'

import {
  Card,
  CardContent,
  Typography,
} from '@material-ui/core'
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles'
import * as colors from '@material-ui/core/colors'

import ErrorIcon from '@material-ui/icons/ErrorOutlined'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'


type AlertType = 'error' | 'warning' | 'success'

interface AlertProps extends PropClasses {
  type: AlertType
  message: string
}

function getClassName(props: AlertProps) {
  const classNames = [props.classes.alert]
  switch (props.type) {
    case 'error': classNames.push(props.classes.error); break
    case 'warning': classNames.push(props.classes.warning); break
    case 'success': classNames.push(props.classes.success); break
  }

  return classNames.join(' ')
}

const Alert = (props: AlertProps) => (
  <Card className={getClassName(props)}>
    <CardContent className={props.classes.cardContent}>
      <Typography className={props.classes.typography}>
        {props.type === 'error' && <ErrorIcon />}
        {props.type === 'warning' && <WarningIcon />}
        {props.type === 'success' && <InfoIcon />}
        {props.message}
      </Typography>
    </CardContent>
  </Card>
)

const styles : StyleRulesCallback = () => ({
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

export default withStyles(styles)(Alert)
