import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { PriceError } from '../types'

export interface DuplicatedPriceDialogProps {
  priceError: PriceError | null
  onClose: () => void
}

export const DuplicatedPriceDialog = (props: DuplicatedPriceDialogProps) => {
  if (props.priceError === null) return null

  return (
    <Dialog
      open={props.priceError !== null}
      onClose={props.onClose}
    >
      <DialogTitle>Precio Duplicado</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Ya existe un precio llamado &quot;{props.priceError.priceName}&quot;
          para el producto {props.priceError.productName}, por favor elimine
          el precio anterior si desea cambiarlo.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color='primary'>Aceptar</Button>
      </DialogActions>
    </Dialog>
  )
}
