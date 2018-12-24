import * as React from 'react'

import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AddCircle'

interface Props extends PropClasses {

}

class PricePicker extends React.Component<Props> {
  render() {
    const { props } = this
    const { classes } = props
    return (
      <>
        <Button
          className={classes.button}
          variant='outlined'
          color='primary'
        >
          <AddIcon className={[classes.icon, classes.leftIcon].join(' ')} />
          Agregar Precio
        </Button>
      </>
    )
  }
}

const styles : StyleRulesCallback = (theme: Theme) => ({
  button: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
    '& *': {
      verticalAlign: 'top',
    },
  },
  icon: {
    fontSize: '1.5em',
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
})

export default withStyles(styles)(PricePicker)
