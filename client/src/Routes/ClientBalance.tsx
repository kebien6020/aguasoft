import { useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { green, red } from '@mui/material/colors'
import { isSameDay, startOfDay } from 'date-fns'
import { useParams } from 'react-router'

import Layout from '../components/Layout'
import LoadingScreen from '../components/LoadingScreen'
import { money, formatDateCol, parseDateonlyMachine } from '../utils'
import { Theme } from '../theme'
import { Change, useClient, useClientBalance } from '../hooks/api/useClients'

interface Params {
  readonly id: string
}

interface IncompleteChangeGroup {
  date: Date
  total: number
  changes: Change[]
  type: 'sell' | 'payment'
  newBalance?: number
}

interface ChangeGroupItem extends IncompleteChangeGroup {
  newBalance: number
}

const ClientBalance = () => {
  const params = useParams() as unknown as Params

  const clientId = Number(params.id)
  const [client] = useClient(clientId)
  const [changes] = useClientBalance(clientId)

  const changeGroups = useMemo(() => changes ? groupChanges(changes) : undefined, [changes])

  if (client === null)
    return <LoadingScreen text='Cargando cliente...' />

  if (changeGroups === undefined)
    return <LoadingScreen text='Cargando balance...' />

  return (
    <Layout title={'Balance Cliente: ' + client.name}>
      {changeGroups.map(ch =>
        <ChangeGroup ch={ch} key={ch.date.toISOString()} />,
      )}
    </Layout>
  )
}
export default ClientBalance

interface ChangeGroupProps {
  ch: ChangeGroupItem
}

const ChangeGroup = ({ ch }: ChangeGroupProps) => {
  const textColor = ch.type === 'sell' ? green[500] : red[500]
  return (
    <ChangeGroupCard>
      <CardDate>
        <Typography>{formatDateCol(ch.date)}</Typography>
      </CardDate>
      <CardType>
        <Typography sx={{ color: textColor }}>
          {ch.type === 'sell' ? 'Venta' : 'Pago'}
        </Typography>
      </CardType>
      <CardValue>
        <Typography>
          {ch.type === 'sell' ? 'Ventas del día:' : 'Valor pagado: '}
          {money(ch.total)}
        </Typography>
      </CardValue>
      <CardBalance>
        <Typography>
          Balance: {money(ch.newBalance)}
        </Typography>
      </CardBalance>
    </ChangeGroupCard>
  )
}

const ChangeGroupCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  textAlign: 'center',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}))

const CardDate = styled('div')({
  overflow: 'hidden',
  width: '20%',
})

const CardType = styled('div')({
  width: '10%',
})

const CardValue = styled('div')({
  width: '35%',
})

const CardBalance = styled('div')({
  width: '35%',
})

const groupChanges = (changes: Change[]) => {
  type Groups = IncompleteChangeGroup[]

  const pushNewGroup = (change: Change, groups: Groups) => {
    groups.push({
      date: parseDateonlyMachine(change.date),
      total: change.value,
      changes: [change],
      type: change.type,
    })
  }

  const addToLastGroup = (change: Change, prev: IncompleteChangeGroup) => {
    prev.total += change.value
    prev.changes.push(change)
  }

  const groups: Groups = []

  for (const change of changes) {
    const prev = groups[groups.length - 1] as IncompleteChangeGroup | undefined

    // New group when:
    const newGroup =
      // no previous
      prev === undefined
      // do not mix types
      || prev.type !== change.type
      // do not combine payments
      || prev.type === 'payment'
      // only combine from same day
      || !isSameDay(prev.date, parseDateonlyMachine(change.date))

    if (newGroup)
      pushNewGroup(change, groups)
    else
      addToLastGroup(change, prev)

  }

  for (let i = 0; i < groups.length; ++i) {
    const prev = groups[i - 1] as IncompleteChangeGroup | undefined

    let balance = prev === undefined ? 0 : prev.newBalance as number
    const chngValue = groups[i].total
    const delta = groups[i].type === 'sell' ? chngValue : -chngValue
    balance += delta
    groups[i].newBalance = balance
  }

  groups.reverse()

  return groups as ChangeGroupItem[]
}
