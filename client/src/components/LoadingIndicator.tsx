import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

const LoadingIndicator = () => {
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
