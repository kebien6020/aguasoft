import type { JSX } from 'react'
import { forwardRef, useCallback } from 'react'
import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { TableChart as TableIcon, TrendingUp } from '@mui/icons-material'
import { Link, LinkProps, useNavigate } from 'react-router'
import Title from '../../../components/Title'
import { MakeOptional } from '../../../utils/types'

export const ToolsWidget = (): JSX.Element => {
  const navigate = useNavigate()

  const goToCreditBalance = useCallback(() => {
    navigate('/clients/balance')
  }, [navigate])

  return (<>
    <Title>Herramientas</Title>
    <Paper>
      <List>
        <ListItemButton component={LinkToBillingSummary}>
          <ListItemIcon>
            <TableIcon />
          </ListItemIcon>
          <ListItemText primary='Facturación' />
        </ListItemButton>
        <ListItemButton onClick={goToCreditBalance}>
          <ListItemIcon>
            <TrendingUp />
          </ListItemIcon>
          <ListItemText primary='Balance de Crédito' />
        </ListItemButton>
      </List>
    </Paper>
  </>)
}

type LinkToBillingSummaryProps = MakeOptional<LinkProps, 'to'>
const LinkToBillingSummary = forwardRef<HTMLAnchorElement, LinkToBillingSummaryProps>(
  function LinkToBillingSummary(props, ref) {
    return (
      <Link to='/tools/billing-summary' ref={ref} {...props} />
    )
  },
)
