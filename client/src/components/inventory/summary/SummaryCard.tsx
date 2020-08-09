import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card, { CardProps } from '@material-ui/core/Card'
import clsx from 'clsx'

const SummaryCard = ({ className, ...otherProps }: CardProps): JSX.Element => {
  const classes = useStyles()
  return <Card className={clsx(classes.card, className)} {...otherProps} />
}

const useStyles = makeStyles(theme => ({
  card: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
    height: '100%',
    marginBottom: '1rem',
  },
}))

export default SummaryCard
