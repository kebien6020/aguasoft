import * as React from 'react'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import adminOnly from '../hoc/adminOnly'
import { fetchJsonAuth, isErrorResponse, ErrorResponse } from '../utils'
import { Client } from '../models'
import LoadingScreen from '../components/LoadingScreen'
import Alert from '../components/Alert'
import ResponsiveContainer from '../components/ResponsiveContainer'
import normalFont from '../hoc/normalFont'

interface ClientCardProps {
  client: Client
  className: string
}

const ClientCard = (props: ClientCardProps) => (
  <Card className={props.className}>
    <CardHeader
      title={props.client.name}
    />
  </Card>
)

type ClientsResponse = Client[] | ErrorResponse

type Props = AuthRouteComponentProps<any> & PropClasses

interface State {
  clientsError: boolean
  clients: Client[] | null
}

class ClientList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      clientsError: false,
      clients: null,
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

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null) {
      return <LoadingScreen text='Cargando clientes…' />
    }

    return (
      <Layout>
        <div className={classes.title}>
          <Typography variant='h1'>Clientes</Typography>
        </div>
        <ResponsiveContainer variant='normal'>
          {state.clientsError &&
            <Alert type='error' message='Error cargando lista de clientes' />
          }
          {state.clients &&
            state.clients.map(cl =>
              <ClientCard key={cl.id} client={cl} className={classes.card}/>
            )
          }
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles : StyleRulesCallback = (theme: Theme) => ({
  title: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    '& > *': {
      textAlign: 'center',
    },
  },
  card: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  }
})

export default
  adminOnly(
  withStyles(styles)(
  normalFont(
    ClientList)))
