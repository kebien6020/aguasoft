import type { JSX } from 'react'
import { forwardRef } from 'react'
import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { TableChart as TableIcon } from '@mui/icons-material'
import { Link, LinkProps } from 'react-router'
import Title from '../../../components/Title'
import { MakeOptional } from '../../../utils/types'

export const ToolsWidget = (): JSX.Element => {
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
