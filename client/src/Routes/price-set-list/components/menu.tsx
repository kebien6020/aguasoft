import { useTheme } from '@mui/material/styles'
import useUser from '../../../hooks/useUser'
import { PriceSet } from '../../../models'
import { useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Delete, Edit, Person } from '@mui/icons-material'
import { Link } from 'react-router'
import useAuth from '../../../hooks/useAuth'
import { fetchJsonAuth, isErrorResponse } from '../../../utils'
import useSnackbar from '../../../hooks/useSnackbar'

export interface ItemDialogProps {
  open: boolean
  onClose: () => void
  priceSet?: PriceSet
  refresh: () => void
}

export const ItemDialog = ({ open, onClose, priceSet, refresh }: ItemDialogProps) => {
  const user = useUser()
  const theme = useTheme()
  const auth = useAuth()
  const showError = useSnackbar()

  const colorMain = useMemo(() => ({
    color: theme.palette.primary.main,
  }), [theme.palette.primary.main])
  const colorDelete = useMemo(() => ({
    color: theme.palette.error.main,
  }), [theme.palette.error.main])

  if (!priceSet) return null

  const handleDelete = () => {
    (async () => {
      try {
        const url = `/api/price-sets/${priceSet.id}`
        const res = await fetchJsonAuth(url, auth, {
          method: 'DELETE',
        })

        if (isErrorResponse(res))
          showError(`Error al eliminar el conjunto de precios: ${res.error.message}`)

      } catch (error) {
        showError(`Error de conexión al eliminar el conjunto de precios: ${String(error)}`)
      }

      onClose()
      refresh()
    })()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ paddingBottom: 0 }}>
        {priceSet.name}
      </DialogTitle>
      <List>
        {user?.isAdmin && <ListItemButton component={Link} to={`/prices/${priceSet.id}`}>
          <ListItemIcon>
            <Edit sx={colorMain} />
          </ListItemIcon>
          <ListItemText primary='Editar' />
        </ListItemButton>}
        {/* <ListItemButton>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary='Clientes con este conjunto de precios' />
        </ListItemButton> */}
        <ListItemButton onClick={handleDelete}>
          <ListItemIcon>
            <Delete sx={colorDelete} />
          </ListItemIcon>
          <ListItemText primary='Eliminar' />
        </ListItemButton>
      </List>
    </Dialog>
  )
}
