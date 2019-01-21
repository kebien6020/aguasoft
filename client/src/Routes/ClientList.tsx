import * as React from 'react'
import { Redirect, Link } from 'react-router-dom'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import BackIcon from '@material-ui/icons/ArrowBack'
import PersonIcon from '@material-ui/icons/Person'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import * as colors from '@material-ui/core/colors'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import adminOnly from '../hoc/adminOnly'
import { fetchJsonAuth, isErrorResponse, ErrorResponse } from '../utils'
import { Client } from '../models'
import LoadingScreen from '../components/LoadingScreen'
import Alert from '../components/Alert'
import ResponsiveContainer from '../components/ResponsiveContainer'

interface ClientItemProps extends PropClasses {
  client: Client
  className: string
  onClick?: () => any
}

const ClientItemRaw = ({classes, client, className, onClick}: ClientItemProps) => (
  <>
    <ListItem className={className} button onClick={onClick}>
      <ListItemAvatar>
        <Avatar className={client.defaultCash ? classes.cash : classes.post}>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={client.name}
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
}

const ClientItem = withStyles(clientStyles)(ClientItemRaw)

interface ClientDialogProps extends PropClasses {
  client: Client
  open: boolean
  onClose: () => any
  onClientEdit: (cl: Client) => any
  onClientDelete: (cl: Client) => any
}

const ClientDialogRaw = (props: ClientDialogProps) => (
  <Dialog open={props.open} onClose={props.onClose} fullWidth>
    <DialogTitle className={props.classes.title}>
      {props.client.name}
    </DialogTitle>
    <List>
      <ListItem button onClick={() => props.onClientEdit(props.client)}>
        <ListItemIcon>
          <EditIcon className={props.classes.editIcon} />
        </ListItemIcon>
        <ListItemText primary='Editar' />
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

const clientDialogStyles : StyleRulesCallback = (theme: Theme) => ({
  editIcon: {
    color: theme.palette.primary.main,
  },
  deleteIcon: {
    color: colors.red[500],
  },
  title: {
    paddingBottom: 0,
  }
})

const ClientDialog = withStyles(clientDialogStyles)(ClientDialogRaw)

type ClientsResponse = Client[] | ErrorResponse

type Props = AuthRouteComponentProps<any> & PropClasses

interface State {
  clientsError: boolean
  clients: Client[] | null
  clientDialogOpen: boolean
  selectedClient: Client | null
  clientDeleteDialogOpen: boolean
  redirectToEdit: boolean
  deletedClient: string | null // Client name if not null
  errorDeleting: boolean
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
      deletedClient: null,
      errorDeleting: false,
    }
  }

  async componentDidMount() {
    const { props } = this
    let clients = null
    try {
      clients =
        await fetchJsonAuth('/api/clients', props.auth) as ClientsResponse
    } catch (e) {
      this.setState({clientsError: true})
    }

    if (clients) {
      if (isErrorResponse(clients)) {
        this.setState({clientsError: true})
        console.error(clients.error)
      } else {
        this.setState({clients})
      }
    }
  }

  renderLinkToNew = (props: any) => <Link to='/clients/new' {...props} />

  renderLinkBack = (props: any) => <Link to='/' {...props} />

  handleClientClick = (client: Client) => {
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

  handleClientTryDelete = (client: Client) => {
    this.setState({
      clientDialogOpen: false,
      clientDeleteDialogOpen: true,
      selectedClient: client
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
      'method': 'DELETE',
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

    this.setState({clientDeleteDialogOpen: false})
    window.scroll(0, 0)
  }

  handleClientEdit = () => {
    if (!this.state.selectedClient) return

    this.setState({redirectToEdit: true})
  }

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null) {
      return <LoadingScreen text='Cargando clientes…' />
    }

    if (state.redirectToEdit && state.selectedClient) {
      return <Redirect push to={`/clients/${state.selectedClient.id}`} />
    }

    return (
      <Layout>
        <AppBar position='static' className={classes.appbar}>
          <Toolbar>
            <IconButton
              className={classes.backButton}
              color='inherit'
              aria-label='Back'
              component={this.renderLinkBack}
            >
              <BackIcon />
            </IconButton>
            <Typography variant='h6' color='inherit' className={classes.title}>
              Clientes
            </Typography>
            <Button
              component={this.renderLinkToNew}
              color='inherit'
            >
              Nuevo
            </Button>
          </Toolbar>
        </AppBar>
        {state.clientDialogOpen && state.selectedClient &&
          <ClientDialog
            open={true}
            onClose={this.handleClientDialogClose}
            client={state.selectedClient}
            onClientEdit={this.handleClientEdit}
            onClientDelete={this.handleClientTryDelete}
          />
        }
        {state.clientDeleteDialogOpen && state.selectedClient &&
          <Dialog
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
        <ResponsiveContainer variant='normal'>
          <div className={classes.newClientButtonContainer}>

          </div>
          {state.clientsError &&
            <Alert type='error' message='Error cargando lista de clientes' />
          }
          {state.errorDeleting &&
            <Alert type='error' message='Error eliminado cliente' />
          }
          {state.deletedClient &&
            <Alert
              type='success'
              message={`Cliente ${state.deletedClient} eliminado exitosamente.`}
            />
          }
          <List>
            {state.clients &&
              state.clients.map(cl =>
                <ClientItem
                  key={cl.id}
                  client={cl}
                  className={classes.item}
                  onClick={() => this.handleClientClick(cl)}
                />
              )
            }
          </List>
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles : StyleRulesCallback = (_theme: Theme) => ({
  appbar: {
    flexGrow: 1,
  },
  backButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    flexGrow: 1,
    '& h6': {
      fontSize: '48px',
      fontWeight: 400,
    },
  },
  item: {},
  deleteButton: {
    color: colors.red[500],
    fontWeight: 'bold',
  },
  newClientButtonContainer: {
    textAlign: 'center',
  },
})

export default
  adminOnly(
  withStyles(styles)(
    ClientList))
