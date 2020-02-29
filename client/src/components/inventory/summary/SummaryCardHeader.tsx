import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardHeader, { CardHeaderProps } from '@material-ui/core/CardHeader'
import clsx from 'clsx'

const SummaryCardHeader = ({className, ...otherProps}: CardHeaderProps) => {
  const classes = useStyles()
  return <CardHeader
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

export default SummaryCardHeader
