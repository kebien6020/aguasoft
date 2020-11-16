import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import * as colors from '@material-ui/core/colors'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'
import { AttachMoney as MoneyIcon } from '@material-ui/icons'
import NoteIcon from '@material-ui/icons/Chat'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import PersonIcon from '@material-ui/icons/Person'
import TableIcon from '@material-ui/icons/TableChart'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import * as React from 'react'
import { Link, Redirect } from 'react-router-dom'
import { AuthRouteComponentProps } from '../AuthRoute'
import Alert from '../components/Alert'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import ResponsiveContainer from '../components/ResponsiveContainer'
import adminOnly from '../hoc/adminOnly'
import { Client } from '../models'
import { fetchJsonAuth, isErrorResponse } from '../utils'



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
    <ListItem className={className} button onClick={onClick}>
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
    </ListItem>
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

type ClientDialogAllProps = ClientDialogProps & PropClasses

const ClientDialogRaw = (props: ClientDialogAllProps) => (
  <Dialog open={props.open} onClose={props.onClose} fullWidth>
    <DialogTitle className={props.classes.title}>
      {props.client.name}
    </DialogTitle>
    <List>
      <ListItem button onClick={() => props.onClientEdit(props.client)}>
        <ListItemIcon>
          <EditIcon className={props.classes.mainIcon} />
        </ListItemIcon>
        <ListItemText primary='Editar' />
      </ListItem>
      <ListItem button onClick={() => props.onClientShowBalance(props.client)}>
        <ListItemIcon>
          <MoneyIcon className={props.classes.balanceIcon} />
        </ListItemIcon>
        <ListItemText primary='Ver balance' />
      </ListItem>
      <ListItem
        button
        to={`/tools/billing-summary?clientId=${props.client.id}`}
        component={Link}
      >
        <ListItemIcon>
          <TableIcon className={props.classes.mainIcon} />
        </ListItemIcon>
        <ListItemText primary='Facturación' />
      </ListItem>
      {props.client.notes
        && <ListItem button onClick={() => props.onClientShowNotes(props.client)}>
          <ListItemIcon>
            <NoteIcon />
          </ListItemIcon>
          <ListItemText primary='Ver info. de contacto' />
        </ListItem>
      }
      <ListItem button onClick={() => props.client.hidden
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
      </ListItem>
      <ListItem button onClick={() => props.onClientDelete(props.client)}>
        <ListItemIcon>
          <DeleteIcon className={props.classes.deleteIcon} />
        </ListItemIcon>
        <ListItemText primary='Eliminar' />
      </ListItem>
    </List>
  </Dialog>
)

const clientDialogStyles : StyleRulesCallback<Theme, ClientDialogProps> = theme => ({
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

const ClientDialog = withStyles(clientDialogStyles)(ClientDialogRaw)

type Props = AuthRouteComponentProps<Record<string, unknown>> & PropClasses

interface State {
  clientsError: boolean
  clients: ClientWithNotes[] | null
  clientDialogOpen: boolean
  selectedClient: ClientWithNotes | null
  clientDeleteDialogOpen: boolean
  redirectToEdit: boolean
  redirectToBalance: boolean
  deletedClient: string | null // Client name if not null
  errorDeleting: boolean
  menuAnchor: HTMLElement | null
  showHidden: boolean
  notesDialogOpen: boolean
}

class ClientList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      clientsError: false,
      clients: null,
      clientDialogOpen: false,
      selectedClient: null,
      clientDeleteDialogOpen: false,
      redirectToEdit: false,
      redirectToBalance: false,
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
    if (!this.state.selectedClient) return

    this.setState({ redirectToEdit: true })
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

  handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => this.setState({ menuAnchor: event.currentTarget })

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
    if (!this.state.selectedClient) return

    this.setState({ redirectToBalance: true })
  }

  // eslint-disable-next-line complexity
  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null)
      return <LoadingScreen text='Cargando clientes…' />


    if (state.redirectToEdit && state.selectedClient)
      return <Redirect push to={`/clients/${state.selectedClient.id}`} />


    if (state.redirectToBalance && state.selectedClient)
      return <Redirect push to={`/clients/${state.selectedClient.id}/balance`} />


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

const styles : StyleRulesCallback<Theme, Props> = _theme => ({
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

interface AppBarExtraProps {
  showHidden: boolean
  onToggleHidden: () => unknown
}


const AppBarExtra = ({ showHidden, onToggleHidden }: AppBarExtraProps) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null)
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
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
    >
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

export default
adminOnly(
  withStyles(styles)(
    ClientList))
