/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Theme } from '@mui/material/styles'

import { StyleRulesCallback } from '@mui/styles'
import withStyles from '@mui/styles/withStyles'

import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/AddCircle'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import PriceField from './PriceField'

import { Product, Price } from '../models'
import { Component } from 'react'
import type { ChangeEvent } from 'react'

export type IncompletePrice = Pick<Price, 'name' | 'productId' | 'value'>

interface Props {
  clientName: string
  products: Product[]
  onNewPrice?: (price: IncompletePrice) => void
}

type PropsAll = Props & PropClasses

interface State {
  dialogOpen: boolean
  name: string
  currentProduct: string
  currentPrice: string
}

type ValChangeEvent = ChangeEvent<{ value: string }>

class PricePicker extends Component<PropsAll, State> {
  state = {
    dialogOpen: false,
    name: 'Base',
    currentProduct: this.props.products[0] ? String(this.props.products[0].id) : '',
    currentPrice: this.props.products[0] ? this.props.products[0].basePrice : '0',
  } as State

  componentDidUpdate(prevProps: Props) {
    if (prevProps.products.length !== this.props.products.length) {
      this.setState({
        currentProduct: String(this.props.products?.[0]?.id ?? ''),
      })
    }
  }

  handleChangeEvent = (name: keyof State) => (event: ValChangeEvent) => {
    // Save value to a variable because it may change (synthetic events
    // may be re-used by react)
    const value = event.target.value
    this.handleChange(name, value)
  }

  handleChange = (name: keyof State, value: string) => {
    this.setState((prevState: State) => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleProductChange = (value: string) => {
    this.handleChange('currentProduct', value)

    const { products } = this.props
    const currentProduct = products.find(pr =>
      String(pr.id) === value
    )

    if (currentProduct)
      this.setState({ currentPrice: currentProduct.basePrice })

  }

  handleProductChangeEvent = (event: SelectChangeEvent) => {
    const value = event.target.value
    this.handleProductChange(value)
  }

  handleNewPrice = () => {
    const { state, props } = this
    if (props.onNewPrice) {
      props.onNewPrice({
        name: state.name,
        productId: Number(state.currentProduct),
        value: state.currentPrice,
      })
    }
    this.setState({ dialogOpen: false })

    setTimeout(() => {
      // Reset state of the dialog after the animation of the dialog is done
      // so that people won't think the dialog changed before actually
      // saving the values
      this.setState({ name: 'Base' })
      this.handleProductChange(String(props.products[0].id))
    }, 200)
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
          onClick={() => this.setState({ dialogOpen: true })}
        >
          <AddIcon className={[classes.icon, classes.leftIcon].join(' ')} />
          Agregar Precio
        </Button>
        <Dialog
          open={state.dialogOpen}
          onClose={() => this.setState({ dialogOpen: false })}
        >
          <DialogTitle>
            Definir nuevo precio
            {props.clientName.length > 0 && ` para ${props.clientName}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              label='Nombre del Precio'
              margin='normal'
              fullWidth
              onChange={this.handleChangeEvent('name')}
              value={state.name}
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel htmlFor='currentProduct'>Producto</InputLabel>
              <Select
                inputProps={{ id: 'currentProduct', name: 'currentProduct' }}
                onChange={this.handleProductChangeEvent}
                value={state.currentProduct}
              >
                {
                  props.products.length > 0
                    ? props.products.map(pr => (
                      <MenuItem value={String(pr.id)} key={String(pr.id)}>
                        ({pr.code}) {pr.name}
                      </MenuItem>
                    ))
                    : 'Cargando...'
                }
              </Select>
            </FormControl>
            <PriceField
              label='Valor'
              onChange={this.handleChangeEvent('currentPrice')}
              value={state.currentPrice}
            />
          </DialogContent>
          <DialogActions>
            <Button color='primary' onClick={() => this.setState({ dialogOpen: false })}>
              Cancelar
            </Button>
            <Button color='primary' onClick={this.handleNewPrice} autoFocus>
              Agregar
            </Button>
          </DialogActions>

        </Dialog>
      </>
    )
  }
}

const styles: StyleRulesCallback<Theme, Props> = theme => ({
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
    marginRight: theme.spacing(1),
  },
})

export default withStyles(styles)(PricePicker)
