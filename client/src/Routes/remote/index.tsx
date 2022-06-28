import * as React from 'react'
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  ListItemIcon,
} from '@material-ui/core'
import {
  Extension as MachineIcon,
} from '@material-ui/icons'
import { Link as RouterLink, useRouteMatch } from 'react-router-dom'

import Layout from '../../components/Layout'
import adminOnly from '../../hoc/adminOnly'
import { VSpace } from '../../components/utils'

interface Machine {
  slug: string
  name: string
}

const machines: Machine[] = [
  {
    slug: 'agua-tank-control',
    name: 'Control de Tanques',
  },
]

const RemoteList = (): JSX.Element => (
  <Layout title='Control Remoto'>
    <VSpace />
    <Paper>
      <List>
        {machines.map(m => <RemoteItem key={m.slug} machine={m} />)}
      </List>
    </Paper>
  </Layout>
)
export default adminOnly(RemoteList)

interface RemoteItemProps {
  machine: Machine
}
const RemoteItem = ({ machine }: RemoteItemProps) => (
  <ListItem
    button
    component={RouterLink}
    to={`${useRouteMatch().path}/control/${machine.slug}`}
  >
    <ListItemIcon>
      <MachineIcon />
    </ListItemIcon>
    <ListItemText primary={machine.name} />
  </ListItem>
)
