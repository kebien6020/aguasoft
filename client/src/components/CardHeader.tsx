import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MuiCardHeader, { CardHeaderProps } from '@material-ui/core/CardHeader'
import clsx from 'clsx'

const CardHeader = ({className, ...otherProps}: CardHeaderProps) => {
  const classes = useStyles()
  return <MuiCardHeader
    className={clsx(classes.header, className)}
    classes={{title: classes.title}}
    {...otherProps}
  />
}

const useStyles = makeStyles({
  header: {
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
})

export default CardHeader
