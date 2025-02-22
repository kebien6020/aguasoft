import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { grey, blue, deepOrange } from '@mui/material/colors'
import { Person as PersonIcon } from '@mui/icons-material'

import { ClientWithNotes } from '../types'


export interface ClientItemProps {
  client: ClientWithNotes
  className?: string
  onClick?: () => unknown
}

export const ClientItem = ({ client, className, onClick }: ClientItemProps) => {
  const avatarColor = (() => {
    if (client.hidden) return grey[500]
    if (client.defaultCash) return blue[500]
    return deepOrange[500]
  })()

  return (
    <>
      <ListItemButton className={className} onClick={onClick}>
        <ListItemAvatar>
          <Avatar sx={{ backgroundColor: avatarColor }}>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={client.name}
          slotProps={{
            primary: {
              sx: client.hidden ? { color: grey[500] } : {},
            },
          }}
          secondary={client.notes && client.notes.split('\n')[0]} />
      </ListItemButton>
      <Divider />
    </>
  )
}
