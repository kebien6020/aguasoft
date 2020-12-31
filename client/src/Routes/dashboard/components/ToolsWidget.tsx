import { List, ListItem, ListItemIcon, ListItemText, Paper } from '@material-ui/core'
import { TableChart as TableIcon } from '@material-ui/icons'
import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import Title from '../../../components/Title'
import { MakeOptional } from '../../../utils/types'

export const ToolsWidget = (): JSX.Element => {
  return (<>
    <Title>Herramientas</Title>
    <Paper>
      <List>
        <ListItem button component={LinkToBillingSummary}>
          <ListItemIcon>
            <TableIcon />
          </ListItemIcon>
          <ListItemText primary='Facturación' />
        </ListItem>
      </List>
    </Paper>
  </>)
}

type LinkToBillingSummaryProps = MakeOptional<LinkProps, 'to'>
const LinkToBillingSummary = React.forwardRef<HTMLAnchorElement, LinkToBillingSummaryProps>(
  function LinkToBillingSummary(props, ref) {
    return (
      <Link to='/tools/billing-summary' ref={ref} {...props} />
    )
  }
)
