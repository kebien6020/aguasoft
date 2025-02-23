import { type ChangeEvent, type MouseEvent, useCallback, useState } from 'react'
import { Link } from 'react-router'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'

export interface AppBarExtraProps {
  showHidden: boolean
  onToggleHidden?: () => unknown
}

type ToggleEvent = ChangeEvent<unknown>

export const AppBarExtra = ({ showHidden, onToggleHidden }: AppBarExtraProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget) 
  }

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null) 
  }, [])
  const handleToggleHidden = useCallback((event: ToggleEvent) => {
    onToggleHidden?.()

    // Avoid double toggle, when clicking the checkbox
    event.stopPropagation()
    event.preventDefault()
  }, [onToggleHidden])

  return (<>
    <Button
      component={Link}
      to='/clients/new'
      color='inherit'
    >
      Nuevo
    </Button>
    <IconButton
      aria-label='Menu'
      aria-owns={'menu'}
      aria-haspopup='true'
      onClick={handleMenuOpen}
      color='inherit'
      size="large">
      <MoreVertIcon />
    </IconButton>
    <Menu
      id='menu'
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleToggleHidden}>
        Ver ocultos
        <Checkbox
          checked={showHidden}
          onChange={handleToggleHidden}
        />
      </MenuItem>
    </Menu>
  </>)
}
