import makeStyles from '@mui/styles/makeStyles'
import MuiCardHeader, { CardHeaderProps } from '@mui/material/CardHeader'
import clsx from 'clsx'

const CardHeader = ({ className, ...otherProps }: CardHeaderProps): JSX.Element => {
  const classes = useStyles()
  return <MuiCardHeader
    className={clsx(classes.header, className)}
    classes={{ title: classes.title }}
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
