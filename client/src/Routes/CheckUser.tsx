import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Button from 'material-ui/Button'
import { FormControl } from 'material-ui/Form'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import Modal from 'material-ui/Modal'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'

const styles: StyleRulesCallback =
  ({ palette, spacing, shadows }: Theme) => ({
    paper: {
      position: 'absolute',
      width: spacing.unit * 48,
      backgroundColor: palette.background.paper,
      boxShadow: shadows[5],
      padding: spacing.unit * 4,
      left: '50%',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)'
    },
    field: {
      marginTop: spacing.unit * 2,
    },
    title: {
      marginBottom: spacing.unit * 4,
    },
    button: {
      marginTop: spacing.unit * 4,
    },
  })

class CheckUser extends React.Component<PropClasses> {
  state = {
    userName: 'hever',
    checked: false,
  }

  handleUserNameChange = (name: string) => {
    this.setState({ userName: name })
  }

  handleContinue = () => {
    this.setState({ checked: true })
  }

  render() {
    const { props, state } = this
    const { classes } = props
    if (state.checked) {
      return <Redirect to='/sell' push />
    }
    return (
      <Modal
        open={true}
      >
        <div className={classes.paper}>
          <Typography variant="title" className={classes.title}>
            Usuario
          </Typography>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel>Usuario</InputLabel>
            <Select
              fullWidth
              className={classes.field}
              value={state.userName}
              onChange={(event) => this.handleUserNameChange(event.target.value)}
            >
              <MenuItem value='hever'>Hever</MenuItem>
              <MenuItem value='jose'>Jose</MenuItem>
              <MenuItem value='alvaro'>Alvaro</MenuItem>
              <MenuItem value='abelardo'>Abelardo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              fullWidth
              label="Contraseña"
              className={classes.field}
              type="password"
              margin="normal"
              inputProps={{inputMode: 'numeric'}}
            />
          </FormControl>
          <Button
            size='large'
            variant='raised'
            color='primary'
            fullWidth
            className={classes.button}
            onClick={this.handleContinue}
          >
            Continuar
          </Button>
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(CheckUser)
