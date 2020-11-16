import { List, ListItem, ListItemIcon, ListItemText, Paper } from '@material-ui/core'
import React from 'react'
import Title from '../../../components/Title'
import { TableChart as TableIcon } from '@material-ui/icons'
import { Link, LinkProps } from 'react-router-dom'
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

const LinkToBillingSummary = (props: MakeOptional<LinkProps, 'to'>) =>
  <Link to='/tools/billing-summary' {...props} />
