import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
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
import { styled } from '@mui/material/styles'

import PriceField from '../../../components/PriceField'
import { Product, Price } from '../../../models'
import { Theme } from '../../../theme'

export type IncompletePrice = Pick<Price, 'name' | 'productId' | 'value'>

interface Props {
  clientName: string
  products: Product[]
  onNewPrice?: (price: IncompletePrice) => void
}

type ValChangeEvent = ChangeEvent<{ value: string }>

const PricePicker = ({ clientName, products, onNewPrice }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('Base')
  const [currentProduct, setCurrentProduct] = useState(products[0]?.id?.toString() ?? '')
  const [currentPrice, setCurrentPrice] = useState(products[0]?.basePrice ?? 0)

  // If the products prop changes, update the currentProduct state
  useEffect(() => {
    setCurrentProduct(products[0]?.id?.toString() ?? '')
  }, [products])

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true)
  }, [])
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
  }, [])
  const handleChangeName = useCallback((event: ValChangeEvent) => {
    setName(event.target.value)
  }, [])
  const handleChangeCurrentPrice = useCallback((event: ValChangeEvent) => {
    setCurrentPrice(Number(event.target.value))
  }, [])

  const handleProductChangeImpl = useCallback((value: string) => {
    setCurrentProduct(value)

    const currentProduct = products.find(pr => String(pr.id) === value)
    if (!currentProduct) {
      console.warn('PricePicker: Product not found')
      return
    }

    setCurrentPrice(currentProduct.basePrice)
  }, [products])

  const handleProductChange = useCallback((event: SelectChangeEvent) => {
    const value = event.target.value
    handleProductChangeImpl(value)
  }, [handleProductChangeImpl])

  const handleNewPrice = useCallback(() => {
    onNewPrice?.({
      name,
      productId: Number(currentProduct),
      value: currentPrice,
    })

    setDialogOpen(false)

    setTimeout(() => {
      // Reset state of the dialog after the animation of the dialog is done
      // so that people won't think the dialog changed before actually
      // saving the values
      setName('Base')
      handleProductChangeImpl(products[0]?.id?.toString() ?? '')
    }, 200)
  }, [currentPrice, currentProduct, handleProductChangeImpl, name, onNewPrice, products])

  return (
    <>
      <StyledButton
        variant='outlined'
        color='primary'
        onClick={handleOpenDialog}
      >
        <AddIconStyled /> Agregar Precio
      </StyledButton>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          Definir nuevo precio
          {clientName.length !== 0 ? ` para ${clientName}` : ''}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Nombre del Precio'
            margin='normal'
            fullWidth
            onChange={handleChangeName}
            value={name}
          />
          <FormControl fullWidth margin='normal'>
            <InputLabel htmlFor='currentProduct'>Producto</InputLabel>
            <Select
              inputProps={{ id: 'currentProduct', name: 'currentProduct' }}
              onChange={handleProductChange}
              value={currentProduct}
            >
              {
                products.length > 0
                  ? products.map(pr => (
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
            onChange={handleChangeCurrentPrice}
            value={currentPrice}
          />
        </DialogContent>
        <DialogActions>
          <Button color='primary' onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button color='primary' onClick={handleNewPrice} autoFocus>
            Agregar
          </Button>
        </DialogActions>

      </Dialog>
    </>
  )
}

const StyledButton = styled(Button)({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
  '& *': {
    verticalAlign: 'top',
  },
})

const AddIconStyled = styled(AddIcon)(({ theme }: { theme: Theme }) => ({
  fontSize: '1.5em',
  marginRight: theme.spacing(1),
}))

export default PricePicker
