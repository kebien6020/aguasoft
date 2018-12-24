import * as React from 'react'

import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AddCircle'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'

import { Product } from '../models'

interface Props extends PropClasses {
  clientName: string
  products: Product[]
}

interface State {
  dialogOpen: boolean
  name: string
  currentProduct: string
}

type ValChangeEvent = { target: { value: string } }

class PricePicker extends React.Component<Props, State> {
  state = {
    dialogOpen: false,
    name: 'Base',
    currentProduct: this.props.products[0] ? String(this.props.products[0].id) : ''
  } as State

  componentWillReceiveProps(newProps: Props) {
    if (newProps.products.length > this.props.products.length) {
      this.setState({currentProduct: String(newProps.products[0].id)})
    }
  }

  handleChange = (name: keyof State) => (event: ValChangeEvent) => {
    // Save value to a variable because it may change (synthetic events
    // may be re-used by react)
    const value = event.target.value
    this.setState((prevState: State) => ({
        ...prevState,
        [name]: value,
    }))
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <>
        <Button
          className={classes.button}
          variant='outlined'
          color='primary'
          onClick={() => this.setState({dialogOpen: true})}
        >
          <AddIcon className={[classes.icon, classes.leftIcon].join(' ')} />
          Agregar Precio
        </Button>
        <Dialog
          open={state.dialogOpen}
          onClose={() => this.setState({dialogOpen: false})}
        >
          <DialogTitle>
            Crear nuevo precio
            {props.clientName.length > 0 && ` para ${props.clientName}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              label='Nombre del Precio'
              margin='normal'
              fullWidth
              onChange={this.handleChange('name')}
              value={state.name}
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel htmlFor='currentProduct'>Producto</InputLabel>
              <Select
                inputProps={{id: 'currentProduct', name: 'currentProduct'}}
                onChange={this.handleChange('currentProduct')}
                value={state.currentProduct}
              >
                {
                  props.products.length > 0 ?
                    props.products.map(pr => (
                      <MenuItem value={String(pr.id)} key={String(pr.id)}>
                        ({pr.code}) {pr.name}
                      </MenuItem>
                    )) :
                    'Cargando...'
                }
              </Select>
            </FormControl>
          </DialogContent>

        </Dialog>
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
