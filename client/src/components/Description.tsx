import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'

export interface DescriptionProps {
  title: React.ReactNode
  text: React.ReactNode
}

const Description = (props: DescriptionProps): JSX.Element => {
  const classes = useDescriptionStyles()

  return (
    <div className={classes.container}>
      <strong>{props.title}:</strong>&nbsp;{props.text}
    </div>
  )
}

const useDescriptionStyles = makeStyles({
  container: {
    '& strong': {
      fontWeight: 600,
    },
  },
})

export default Description
