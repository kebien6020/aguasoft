import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import { money } from '../utils'
import { Sell } from './Sells'

import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemAvatar,
  Avatar,
} from '@mui/material'

import {
  Person as PersonIcon,
} from '@mui/icons-material'

import * as colors from '@mui/material/colors'
import { Filter } from '../Routes/Sells'

interface Props {
  sells: Sell[]
  onFilterChange: (updater: (prev: Filter) => Filter) => unknown
  filter: Filter
}

const calcSell = (sells: Sell[], cash: boolean): number => {
  return sells.reduce((acc, sell) => {
    if (sell.cash === cash && !sell.deleted)
      return acc + sell.value

    return acc
  }, 0)
}

const aggregateProducts = (sells: Sell[], filter: Filter) => {
  const productNames = sells
    .map(s => s.Product.name)
    .filter((p, idx, self) => self.indexOf(p) === idx)

  const countProd = (sells: Sell[], pn: string) =>
    sells
      .filter(s => s.Product.name === pn)
      .filter(s => s.deleted === false)
      .filter(s => filter.client === 'ALL' || String(s.Client.id) === filter.client)
      .filter(s => filter.user === 'ALL' || String(s.User.code) === filter.user)
      .reduce((acc, s) => acc + s.quantity, 0)

  return productNames
    .map(pn => [pn, countProd(sells, pn)] as [string, number])
    .filter(([_name, qty]) => qty > 0)
}

type SimpleClient = { id: number, name: string, defaultCash: boolean }
type CalculatedClient = SimpleClient & { totalSale: number }

const compareBy = <T extends Record<string, unknown>>(by: keyof T) => (a: T, b: T) => {
  if (a[by] < b[by]) return -1
  if (a[by] > b[by]) return 1
  return 0
}

const DayOverview = (props: Props): JSX.Element => {
  const classes = useStyles()
  const clients: SimpleClient[] = props.sells
    .map(s => ({ ...s.Client }))
    .filter((client, idx, arr) => {
      return arr.findIndex((cl) => cl.name === client.name) === idx
    })
    .sort(compareBy('name'))

  const calcClients: CalculatedClient[] = clients
    .map(client => {
      return {
        ...client,
        totalSale: props.sells
          .filter(s => s.Client.id === client.id)
          .filter(s => !s.deleted)
          .reduce((acc, s) => acc + s.value, 0),
      }
    })

  const users: Array<Sell['User']> = props.sells
    .map(s => s.User)
    .filter((user, idx, arr) => {
      return arr.findIndex((u) => u.code === user.code) === idx
    })
    .sort(compareBy('code'))

  const clientName = (val: string) => {
    if (val === 'ALL') return 'Todos'
    const client = calcClients.find(cl => String(cl.id) === val)
    return client ? `${client.name} (${money(client.totalSale)})` : ''
  }

  return (
    <Grid container spacing={3} className={classes.summary}>
      <Grid item xs={12} sm={6}>
        <Paper className={classes.paper}>
          <Typography variant='body2'>Venta efectivo: {money(calcSell(props.sells, true))}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper className={classes.paper}>
          <Typography variant='body2'>Venta pago post-fechado: {money(calcSell(props.sells, false))}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography variant='subtitle2'>Productos vendidos en el día</Typography>
          <FormControl fullWidth margin='normal' variant='standard'>
            <InputLabel htmlFor='client-filter'>Cliente</InputLabel>
            <Select
              inputProps={{
                id: 'client-filter',
                name: 'clientFilter',
              }}
              onChange={(event) => {
                const clientId = event.target.value
                props.onFilterChange(prev => ({ ...prev, client: clientId }))
              }}
              value={props.filter.client}
              renderValue={clientName}
            >
              <MenuItem value='ALL'>Todos</MenuItem>
              {calcClients.map(client =>
                <MenuItem
                  value={String(client.id)}
                  key={String(client.id)}
                >
                  <ListItemAvatar>
                    <Avatar className={
                      client.defaultCash
                        ? classes.cashAvatar : classes.postAvatar
                    }>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  {clientName(String(client.id))}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth margin='normal' variant='standard'>
            <InputLabel htmlFor='client-filter'>Vendedor</InputLabel>
            <Select
              inputProps={{
                id: 'user-filter',
                name: 'userFilter',
              }}
              onChange={(event) => {
                const userCode = event.target.value
                props.onFilterChange(prev => ({ ...prev, user: userCode }))
              }}
              value={props.filter.user}
            >
              <MenuItem value='ALL'>Todos</MenuItem>
              {users.map(user =>
                <MenuItem
                  value={String(user.code)}
                  key={String(user.code)}
                >
                  ({user.code}) {user.name}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {aggregateProducts(props.sells, props.filter).map(([name, qty]) =>
            <Typography variant='body2' key={name}>
              {name}: {qty}
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

const useStyles = makeStyles(theme => ({
  summary: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cashAvatar: {
    backgroundColor: colors.blue[500],
  },
  postAvatar: {
    backgroundColor: colors.deepOrange[500],
  },
}))


export default DayOverview
