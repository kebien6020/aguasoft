import makeStyles from '@mui/styles/makeStyles'
import Card, { CardProps } from '@mui/material/Card'
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
