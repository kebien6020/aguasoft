import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import CircularProgress from '@mui/material/CircularProgress'

const LoadingIndicator = (): JSX.Element => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <CircularProgress />
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    paddingTop: '1em',
    paddingBottom: '1em',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
})

export default LoadingIndicator
