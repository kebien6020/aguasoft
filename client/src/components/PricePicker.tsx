import * as React from 'react'

import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AddCircle'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'

import * as NumberFormat from 'react-number-format'

import { Product, Price } from '../models'

export type IncompletePrice = Pick<Price, 'name' | 'productId' | 'value'>

interface Props extends PropClasses {
  clientName: string
  products: Product[]
  onNewPrice?: (price: IncompletePrice) => void
}

interface State {
  dialogOpen: boolean
  name: string
  currentProduct: string
  currentPrice: string
}

type ValChangeEvent = { target: { value: string } }

interface NumFormatProps {
  inputRef: React.Ref<Element>
  onChange: (event: ValChangeEvent) => void
}

function NumberFormatCustom(props: NumFormatProps) {
  const { inputRef, onChange, ...other } = props;

  return (

    // @ts-ignore Weird typing error requiring esModuleInterop in the tsconfig
    //            which breaks the rest of the code
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      thousandSeparator='.'
      decimalSeparator=','
      onValueChange={(values: any) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      prefix='$'
      decimalScale={4}
      isNumericString
    />
  )
}


class PricePicker extends React.Component<Props, State> {
  state = {
    dialogOpen: false,
    name: 'Base',
    currentProduct: this.props.products[0] ? String(this.props.products[0].id) : '',
    currentPrice: this.props.products[0] ? this.props.products[0].basePrice : '0',
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

  handleProductChange = (event: ValChangeEvent) => {
    this.handleChange('currentProduct')(event)

    const { products } = this.props
    const currentProduct = products.find(pr =>
      String(pr.id) === event.target.value
    )
    
    if (currentProduct) {
      this.setState({currentPrice: currentProduct.basePrice})
    }
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
    this.setState({dialogOpen: false})

    setTimeout(() => {
      // Reset state of the dialog after the animation of the dialog is done
      // so that people won't think the dialog changed before actually
      // saving the values
      this.setState({name: 'Base'})
      this.handleProductChange({target: {value: String(props.products[0].id)}})
    }, 200)
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <React.Fragment>
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
            Definir nuevo precio
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
                onChange={this.handleProductChange}
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
            <TextField
              label='Valor'
              margin='normal'
              fullWidth
              InputProps={{inputComponent: NumberFormatCustom}}
              onChange={this.handleChange('currentPrice')}
              value={state.currentPrice}
            />
          </DialogContent>
          <DialogActions>
            <Button color='primary' onClick={() => this.setState({dialogOpen: false})}>
              Cancelar
            </Button>
            <Button color='primary' onClick={this.handleNewPrice} autoFocus>
              Agregar
            </Button>
          </DialogActions>

        </Dialog>
      </React.Fragment>
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
