import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card, { CardProps } from '@material-ui/core/Card'
import clsx from 'clsx'

type BorderedCardProps = CardProps & {
  color?: string
}

const BorderedCard = (props: BorderedCardProps): JSX.Element => {
  const {
    className,
    color,
    ...otherProps
  } = props

  const classes = useStyles()

  const style = color ? { borderLeftColor: color } : undefined

  return (
    <Card
      className={clsx(classes.card, className)}
      style={style}
      {...otherProps}
    />
  )
}

const useStyles = makeStyles(theme => ({
  card: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
    height: '100%',
  },
}))

export default BorderedCard
