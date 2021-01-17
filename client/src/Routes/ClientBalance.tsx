import * as React from 'react'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import * as colors from '@material-ui/core/colors'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import { Client } from '../models'
import { fetchJsonAuth, ErrorResponse, isErrorResponse, money } from '../utils'

import { Moment } from 'moment'
import * as moment from 'moment'

interface Params {
  id: string
}

type Props = AuthRouteComponentProps<Params> & PropClasses

interface State {
  changeGroups: ChangeGroup[] | null
  client: Client | null
}

interface Change {
  date: string
  value: number
  type: 'sell' | 'payment'
  id: number
}

interface IncompleteChangeGroup {
  date: Moment
  total: number
  changes: Change[]
  type: 'sell' | 'payment'
  newBalance?: number
}

interface ChangeGroup extends IncompleteChangeGroup {
  newBalance: number
}

type ChangesResponse = { changes: Change[] } | ErrorResponse

type ClientResponse = Client | ErrorResponse

class ClientBalance extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      changeGroups: null,
      client: null,
    }
  }

  groupChanges = (changes: Change[]) => {
    type Groups = IncompleteChangeGroup[]

    const pushNewGroup = (change: Change, groups: Groups) => {
      groups.push({
        date: moment(change.date).startOf('day'),
        total: change.value,
        changes: [change],
        type: change.type,
      })
    }

    const addToLastGroup = (change: Change, prev: IncompleteChangeGroup) => {
      prev.total += change.value
      prev.changes.push(change)
    }

    const groups : Groups = []

    for (const change of changes) {
      const prev = groups[groups.length - 1]

      // New group when:
      const newGroup =
        // no previous
        prev === undefined
        // do not mix types
        || prev.type !== change.type
        // do not combine payments
        || prev.type === 'payment'
        // only combine from same day
        || !prev.date.isSame(change.date, 'day')

      if (newGroup)
        pushNewGroup(change, groups)
      else
        addToLastGroup(change, prev)

    }

    for (let i = 0; i < groups.length; ++i) {
      const prev = groups[i - 1]

      let balance = prev === undefined ? 0 : prev.newBalance as number
      const chngValue = groups[i].total
      const delta = groups[i].type === 'sell' ? chngValue : -chngValue
      balance += delta
      groups[i].newBalance = balance
    }

    groups.reverse()

    return groups as ChangeGroup[]
  }

  async componentDidMount() {
    const { props } = this
    const { params } = props.match
    const clientId = params.id

    const response : ChangesResponse =
      await fetchJsonAuth(`/api/clients/${clientId}/balance`, props.auth)

    if (!isErrorResponse(response)) {
      const changeGroups = this.groupChanges(response.changes)
      this.setState({ changeGroups })
    } else {
      console.error(response.error)
    }

    const clResponse: ClientResponse =
      await fetchJsonAuth(`/api/clients/${clientId}`, props.auth)

    if (!isErrorResponse(clResponse)) {
      const client = clResponse
      this.setState({ client })
    } else {
      console.error(clResponse.error)
    }
  }

  renderChangeGroup = (ch: ChangeGroup, key: React.Key) => {
    const { classes } = this.props
    return (
      <Card className={classes.card} key={key}>
        <div className={classes.cardDate}>
          <Typography>{ch.date.format('DD/MMM/YY')}</Typography>
        </div>
        <div className={classes.cardType}>
          <Typography className={ch.type === 'sell' ? classes.sell : classes.payment}>
            {ch.type === 'sell' ? 'Venta' : 'Pago'}
          </Typography>
        </div>
        <div className={classes.cardValue}>
          <Typography>
            {ch.type === 'sell'
              ? 'Ventas del día:'
              : 'Valor pagado: '
            }
            {money(ch.total)}
          </Typography>
        </div>
        <div className={classes.cardBalance}>
          <Typography>
            Balance: {money(ch.newBalance)}
          </Typography>
        </div>
      </Card>
    )
  }

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.changeGroups === null)
      return <LoadingScreen text='Cargando balance...' />


    if (state.client === null)
      return <LoadingScreen text='Cargando cliente...' />


    return (
      <Layout title={'Balance Cliente: ' + state.client.name}>
        <div className={classes.cardContainer}>
          {state.changeGroups.map(this.renderChangeGroup)}
        </div>
      </Layout>
    )
  }
}

const styles : StyleRulesCallback<Theme, Props> = theme => ({
  appbar: {
    flexGrow: 1,
  },
  backButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  card: {
    display: 'flex',
    flexFlow: 'row nowrap',
    textAlign: 'center',
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  cardDate: {
    overflow: 'hidden',
    width: '20%',
  },
  cardType: {
    width: '10%',
  },
  cardValue: {
    width: '35%',
  },
  cardBalance: {
    width: '35%',
  },
  sell: {
    color: colors.green[500],
  },
  payment: {
    color: colors.red[500],
  },
  title: {
    flexGrow: 1,
    '& h6': {
      fontSize: '48px',
      fontWeight: 400,
    },
  },
})

export default withStyles(styles)(ClientBalance)
