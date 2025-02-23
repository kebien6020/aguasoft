import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Card, { CardProps } from '@mui/material/Card'
import clsx from 'clsx'
import { Theme } from '../theme'

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

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
    height: '100%',
  },
}))

export default BorderedCard
