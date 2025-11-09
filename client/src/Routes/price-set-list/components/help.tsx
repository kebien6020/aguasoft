import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
} from '@mui/material'
import { useToggle } from '../../../hooks/useToggle'
import { QuestionMark } from '@mui/icons-material'

export const HelpButton = () => {
  const [open, { toggle, close }] = useToggle(false)

  return <>
    <IconButton color='inherit' onClick={toggle}>
      <QuestionMark />
    </IconButton>
    <HelpDialog open={open} onClose={close} />
  </>
}

interface HelpDialogProps {
  open: boolean
  onClose: () => void
}

const HelpDialog = ({ open, onClose }: HelpDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <DialogContentText>
        Aqui se pueden definir los conjuntos de precios disponibles para
        asignar a los clientes.
      </DialogContentText>
      <DialogContentText>
        La opcion de conjuntos de precios esta en progreso y aun no hace
        nada.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} autoFocus color='primary'>
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
)
