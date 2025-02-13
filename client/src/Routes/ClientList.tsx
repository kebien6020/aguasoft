import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import * as colors from '@mui/material/colors'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Theme } from '@mui/material/styles'
import { StyleRulesCallback, WithStyles, makeStyles } from '@mui/styles'
import createStyles from '@mui/styles/createStyles'
import withStyles from '@mui/styles/withStyles'
import { AttachMoney as MoneyIcon } from '@mui/icons-material'
import NoteIcon from '@mui/icons-material/Chat'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonIcon from '@mui/icons-material/Person'
import TableIcon from '@mui/icons-material/TableChart'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Component, MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthRouteComponentProps } from '../AuthRoute'
import Alert from '../components/Alert'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { Client } from '../models'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import { withUser, WithUserProps } from '../hooks/useUser'
import ListItemButton from '@mui/material/ListItemButton'
import useAuth from '../hooks/useAuth'

interface ClientWithNotes extends Client {
  notes: string
}

interface ClientItemProps extends PropClasses {
  client: ClientWithNotes
  className?: string
  onClick?: () => unknown
}

const ClientItemRaw = ({ classes, client, className, onClick }: ClientItemProps) => (
  <>
    <ListItemButton className={className} onClick={onClick}>
      <ListItemAvatar>
        <Avatar className={client.hidden
          ? classes.hiddenIcon
          : (client.defaultCash ? classes.cash : classes.post)
        }>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={client.name}
        primaryTypographyProps={{
          className: client.hidden ? classes.hiddenText : '',
        }}
        secondary={client.notes && client.notes.split('\n')[0]}
      />
    </ListItemButton>
    <Divider />
  </>
)

const clientStyles = {
  cash: {
    backgroundColor: colors.blue[500],
  },
  post: {
    backgroundColor: colors.deepOrange[500],
  },
  hiddenText: {
    color: colors.grey[500],
  },
  hiddenIcon: {
    backgroundColor: colors.grey[500],
  },
}

const ClientItem = withStyles(clientStyles)(ClientItemRaw)

interface ClientDialogProps {
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

type ClientDialogAllProps = ClientDialogProps & PropClasses & WithUserProps

const ClientDialogRaw = (props: ClientDialogAllProps) => (
  <Dialog open={props.open} onClose={props.onClose} fullWidth>
    <DialogTitle className={props.classes.title}>
      {props.client.name}
    </DialogTitle>
    <List>
      {props.user?.isAdmin && <ListItemButton onClick={() => props.onClientEdit(props.client)}>
        <ListItemIcon>
          <EditIcon className={props.classes.mainIcon} />
        </ListItemIcon>
        <ListItemText primary='Editar' />
      </ListItemButton>}
      <ListItemButton onClick={() => props.onClientShowBalance(props.client)}>
        <ListItemIcon>
          <MoneyIcon className={props.classes.balanceIcon} />
        </ListItemIcon>
        <ListItemText primary='Ver balance' />
      </ListItemButton>
      <ListItemButton
        to={`/tools/billing-summary?clientId=${props.client.id}`}
        component={Link}>
        <ListItemIcon>
          <TableIcon className={props.classes.mainIcon} />
        </ListItemIcon>
        <ListItemText primary='Facturación' />
      </ListItemButton>
      {props.user?.isAdmin && props.client.notes
        && <ListItemButton onClick={() => props.onClientShowNotes(props.client)}>
          <ListItemIcon>
            <NoteIcon />
          </ListItemIcon>
          <ListItemText primary='Ver info. de contacto' />
        </ListItemButton>
      }
      {props.user?.isAdmin && <ListItemButton
        onClick={() => props.client.hidden
          ? props.onClientUnhide(props.client)
          : props.onClientHide(props.client)
        }>
        <ListItemIcon>
          {props.client.hidden
            ? <VisibilityOffIcon />
            : <VisibilityIcon />
          }
        </ListItemIcon>
        <ListItemText
          primary={props.client.hidden
            ? 'Desocultar'
            : 'Ocultar'
          }
        />
      </ListItemButton>}
      {props.user?.isAdmin && <ListItemButton onClick={() => props.onClientDelete(props.client)}>
        <ListItemIcon>
          <DeleteIcon className={props.classes.deleteIcon} />
        </ListItemIcon>
        <ListItemText primary='Eliminar' />
      </ListItemButton>}
    </List>
  </Dialog>
)

const clientDialogStyles: StyleRulesCallback<Theme, ClientDialogProps> = theme => ({
  mainIcon: {
    color: theme.palette.primary.main,
  },
  balanceIcon: {
    color: colors.green[500],
  },
  deleteIcon: {
    color: colors.red[500],
  },
  title: {
    paddingBottom: 0,
  },
})

const ClientDialog = withUser(withStyles(clientDialogStyles)(ClientDialogRaw))

type Props = AuthRouteComponentProps & WithStyles<typeof styles>

interface State {
  clientsError: boolean
  clients: ClientWithNotes[] | null
  clientDialogOpen: boolean
  selectedClient: ClientWithNotes | null
  clientDeleteDialogOpen: boolean
  deletedClient: string | null // Client name if not null
  errorDeleting: boolean
  menuAnchor: HTMLElement | null
  showHidden: boolean
  notesDialogOpen: boolean
}

class ClientList extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      clientsError: false,
      clients: null,
      clientDialogOpen: false,
      selectedClient: null,
      clientDeleteDialogOpen: false,
      deletedClient: null,
      errorDeleting: false,
      menuAnchor: null,
      showHidden: false,
      notesDialogOpen: false,
    }
  }

  async componentDidMount() {
    const { props } = this
    let clients = null
    try {
      clients =
        await fetchJsonAuth<ClientWithNotes[]>('/api/clients?includeNotes=true', props.auth)
    } catch (e) {
      this.setState({ clientsError: true })
    }

    if (clients) {
      if (isErrorResponse(clients)) {
        this.setState({ clientsError: true })
        console.error(clients.error)
      } else {
        this.setState({ clients })
      }
    }
  }

  handleClientClick = (client: ClientWithNotes) => {
    this.setState({
      clientDialogOpen: true,
      selectedClient: client,
    })
  }

  handleClientDialogClose = () => {
    this.setState({
      clientDialogOpen: false,
      selectedClient: null,
    })
  }

  handleClientTryDelete = (client: ClientWithNotes) => {
    this.setState({
      clientDialogOpen: false,
      clientDeleteDialogOpen: true,
      selectedClient: client,
    })
  }

  handleClientDeleteDialogClose = () => {
    this.setState({
      clientDeleteDialogOpen: false,
      selectedClient: null,
    })
  }

  handleClientDelete = async () => {
    const { state, props } = this

    if (!state.clients) return
    const client = state.selectedClient
    if (!client) return

    const res = await fetchJsonAuth(`/api/clients/${client.id}`, props.auth, {
      method: 'DELETE',
    })

    if (res.success) {
      // remove client from the list and show success message
      const clients = state.clients.filter(cl => cl.id !== client.id)
      this.setState({
        clients,
        errorDeleting: false,
        deletedClient: client.name,
      })
    } else {
      console.log(res)
      this.setState({
        errorDeleting: true,
        deletedClient: null,
      })
    }

    this.setState({ clientDeleteDialogOpen: false })
    window.scroll(0, 0)
  }

  handleClientEdit = () => {
    const { selectedClient } = this.state
    if (!selectedClient) return

    this.props.history.push(`/clients/${selectedClient.id}`)
  }

  handleClientHide = async () => {
    const { state, props } = this

    if (!state.clients) return
    const client = state.selectedClient
    if (!client) return

    const res = await fetchJsonAuth(`/api/clients/${client.id}/hide`, props.auth, {
      method: 'POST',
    })

    if (res.success) {
      const newClients = state.clients.map(cl => {
        if (cl === client)
          return { ...cl, hidden: true }

        return cl
      })

      this.setState({ clients: newClients, clientDialogOpen: false })
    }

    // TODO: Show some error if we fail to hide the client
  }

  handleClientUnhide = async () => {
    const { state, props } = this

    if (!state.clients) return
    const client = state.selectedClient
    if (!client) return

    const res = await fetchJsonAuth(`/api/clients/${client.id}/unhide`, props.auth, {
      method: 'POST',
    })

    if (res.success) {
      const newClients = state.clients.map(cl => {
        if (cl === client)
          return { ...cl, hidden: false }

        return cl
      })

      this.setState({ clients: newClients, clientDialogOpen: false })
    }

    // TODO: Show some error if we fail to unhide the client
  }

  handleMenuOpen = (event: MouseEvent<HTMLElement>) => this.setState({ menuAnchor: event.currentTarget })

  handleMenuClose = () => this.setState({ menuAnchor: null })

  toggleHidden = () => {
    this.setState({
      showHidden: !this.state.showHidden,
      menuAnchor: null,
    })
  }

  handleClientShowNotes = () => {
    if (!this.state.selectedClient) return

    this.setState({ notesDialogOpen: true, clientDialogOpen: false })
  }

  handleNotesDialogClose = () => this.setState({ notesDialogOpen: false })

  handleClientShowBalance = () => {
    const { selectedClient } = this.state
    if (!selectedClient) return

    this.props.history.push(`/clients/${selectedClient.id}/balance`)
  }

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null)
      return <LoadingScreen text='Cargando clientes…' />

    const clients = state.showHidden
      ? state.clients
      : state.clients.filter(cl => !cl.hidden)

    return (
      <Layout
        title='Lista de Clientes'
        container={ResponsiveContainer}
        appBarExtra={
          <AppBarExtra
            onToggleHidden={this.toggleHidden}
            showHidden={state.showHidden}
          />
        }
      >
        {state.clientDialogOpen && state.selectedClient
          && <ClientDialog
            open={true}
            onClose={this.handleClientDialogClose}
            client={state.selectedClient}
            onClientEdit={this.handleClientEdit}
            onClientHide={this.handleClientHide}
            onClientUnhide={this.handleClientUnhide}
            onClientDelete={this.handleClientTryDelete}
            onClientShowNotes={this.handleClientShowNotes}
            onClientShowBalance={this.handleClientShowBalance}
          />
        }
        {state.clientDeleteDialogOpen && state.selectedClient
          && <Dialog
            open={true}
            onClose={this.handleClientDeleteDialogClose}
          >
            <DialogTitle>Eliminar {state.selectedClient.name}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Desea eliminar permanentemente el
                cliente {state.selectedClient.name} y <strong>todas</strong> las
                ventas y precios asociados?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClientDeleteDialogClose} color="primary">
                Cancelar
              </Button>
              <Button onClick={this.handleClientDelete} className={classes.deleteButton}>
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>
        }
        {state.notesDialogOpen && state.selectedClient
          && <Dialog
            open={true}
            onClose={this.handleNotesDialogClose}
          >
            <DialogTitle style={{ marginBottom: 0 }}>
              {state.selectedClient.name}: Informacion de Contacto
            </DialogTitle>
            <DialogContent>
              {state.selectedClient.notes
                && state.selectedClient.notes.split('\n').map((note, idx) =>
                  <DialogContentText key={idx}>
                    {note}
                  </DialogContentText>
                )
              }
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleNotesDialogClose} autoFocus color='primary'>
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        }
        <div className={classes.newClientButtonContainer}>

        </div>
        {state.clientsError
          && <Alert type='error' message='Error cargando lista de clientes' />
        }
        {state.errorDeleting
          && <Alert type='error' message='Error eliminado cliente' />
        }
        {state.deletedClient
          && <Alert
            type='success'
            message={`Cliente ${state.deletedClient} eliminado exitosamente.`}
          />
        }
        <List>
          {clients.map(cl =>
            <ClientItem
              key={cl.id}
              client={cl}
              onClick={() => this.handleClientClick(cl)}
            />
          )
          }
        </List>
      </Layout>
    )
  }
}

const useStyles = makeStyles({
  appbar: {
    flexGrow: 1,
  },
  deleteButton: {
    color: colors.red[500],
    fontWeight: 'bold',
  },
  newClientButtonContainer: {
    textAlign: 'center',
  },
})

const ClientListWrapper = () => {
  const classes = useStyles()
  const auth = useAuth()
  return <ClientList classes={classes} auth={auth} />
}

export default ClientListWrapper

interface AppBarExtraProps {
  showHidden: boolean
  onToggleHidden: () => unknown
}


const AppBarExtra = ({ showHidden, onToggleHidden }: AppBarExtraProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setMenuAnchor(event.currentTarget)

  const handleMenuClose = () => setMenuAnchor(null)

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
      <MenuItem onClick={onToggleHidden}>
        Ver ocultos
        <Checkbox
          checked={showHidden}
          onChange={onToggleHidden}
        />
      </MenuItem>
    </Menu>
  </>)
}

