import { useMemo } from 'react'
import { Link } from 'react-router'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import {
  Chat as NoteIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TableChart as TableIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { green, red } from '@mui/material/colors'

import useUser from '../../../hooks/useUser'
import { ClientWithNotes } from '../types'

export interface ClientDialogProps {
  client: ClientWithNotes
  open: boolean
  onClose: () => unknown
  onClientEdit: (cl: ClientWithNotes) => unknown
  onClientHide: (cl: ClientWithNotes) => unknown
  onClientUnhide: (cl: ClientWithNotes) => unknown
  onClientDelete: (cl: ClientWithNotes) => unknown
  onClientShowNotes: (cl: ClientWithNotes) => unknown
  onClientShowBalance: (cl: ClientWithNotes) => unknown
}

type ClientDialogAllProps = ClientDialogProps

export const ClientDialog = (props: ClientDialogAllProps) => {
  const {
    client,
    open,
    onClose,
    onClientEdit,
    onClientHide,
    onClientUnhide,
    onClientDelete,
    onClientShowNotes,
    onClientShowBalance,
  } = props
  const user = useUser()
  const theme = useTheme()
  const colorMain = useMemo(() => ({
    color: theme.palette.primary.main,
  }), [theme.palette.primary.main])

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ paddingBottom: 0 }}>
        {client.name}
      </DialogTitle>
      <List>
        {user?.isAdmin && <ListItemButton onClick={() => onClientEdit?.(client)}>
          <ListItemIcon>
            <EditIcon sx={colorMain} />
          </ListItemIcon>
          <ListItemText primary='Editar' />
        </ListItemButton>}
        <ListItemButton onClick={() => onClientShowBalance?.(client)}>
          <ListItemIcon>
            <MoneyIcon sx={{ color: green[500] }} />
          </ListItemIcon>
          <ListItemText primary='Ver balance' />
        </ListItemButton>
        <ListItemButton
          to={`/tools/billing-summary?clientId=${client.id}`}
          component={Link}>
          <ListItemIcon>
            <TableIcon sx={colorMain} />
          </ListItemIcon>
          <ListItemText primary='Facturación' />
        </ListItemButton>
        {user?.isAdmin && client.notes
          && <ListItemButton onClick={() => onClientShowNotes?.(client)}>
            <ListItemIcon>
              <NoteIcon />
            </ListItemIcon>
            <ListItemText primary='Ver info. de contacto' />
          </ListItemButton>}
        {user?.isAdmin && <ListItemButton
          onClick={() => client.hidden
            ? onClientUnhide?.(client)
            : onClientHide(client)}>
          <ListItemIcon>
            {client.hidden
              ? <VisibilityOffIcon />
              : <VisibilityIcon />}
          </ListItemIcon>
          <ListItemText primary={client.hidden ? 'Desocultar' : 'Ocultar'} />
        </ListItemButton>}
        {user?.isAdmin && <ListItemButton onClick={() => onClientDelete?.(client)}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: red[500] }} />
          </ListItemIcon>
          <ListItemText primary='Eliminar' />
        </ListItemButton>}
      </List>
    </Dialog>
  )
}
