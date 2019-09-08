import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
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
} from '@material-ui/core'

import {
  Person as PersonIcon
} from '@material-ui/icons'

import * as colors from '@material-ui/core/colors'

interface Props {
  sells: Sell[]
}

type AllProps = Props & PropClasses

interface State {
  clientFilter: string
}

const calcSell = (sells: Sell[], cash: boolean) : number => {
  return sells.reduce((acc, sell) => {
    if (sell.cash === cash && !sell.deleted) {
      return acc + sell.value
    }
    return acc
  }, 0)
}

const aggregateProducts = (sells: Sell[], clientId: string) => {
  const productNames = sells
    .map(s => s.Product.name)
    .filter((p, idx, self) => self.indexOf(p) === idx)

  const countProd = (sells: Sell[], pn: string) =>
    sells
      .filter(s => s.Product.name === pn)
      .filter(s => s.deleted === false)
      .filter(s => clientId === 'ALL' || String(s.Client.id) === clientId)
      .reduce((acc, s) => acc + s.quantity, 0)

  return productNames
    .map(pn => [pn, countProd(sells, pn)] as [string, number])
    .filter(([_name, qty]) => qty > 0)
}

type ValChangeEvent = React.ChangeEvent<{ value: string }>
type SimpleClient = {id: number, name: string, defaultCash: boolean}
type CalculatedClient = SimpleClient & {totalSale: number}

class DayOverview extends React.Component<AllProps, State> {

  constructor(props: AllProps) {
    super(props)

    this.state = {
      clientFilter: 'ALL'
    }
  }

  handleChange = (name: keyof State) => (event: ValChangeEvent) => {
    // Save value to a variable because it may change (synthetic events
    // may be re-used by react)
    const value = event.target.value
    this.setState((prevState: State) => ({
        ...prevState,
        [name]: value,
    }))
  }

  render() {
    const { props, state } = this

    const compareByName = (a: SimpleClient, b: SimpleClient) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    }

    const clients : SimpleClient[] = props.sells
      .map(s => ({...s.Client}) )
      .filter((client, idx, arr) => {
        return arr.findIndex((cl) => cl.name === client.name) === idx
      })
      .sort(compareByName)

    const calcClients: CalculatedClient[] = clients
      .map(client => {
        return {
          ...client,
          totalSale: props.sells
            .filter(s => s.Client.id === client.id)
            .reduce((acc, s) => acc + s.value, 0)
        }
      })

    const clientName = (val : string) => {
      if (val === 'ALL') return 'Todos'
      const client = calcClients.find(cl => String(cl.id) === val)
      return client ? `${client.name} (${money(client.totalSale)})` : ''
    }

    return (
      <Grid container spacing={3} className={props.classes.summary}>
        <Grid item xs={12}>
          <Paper className={props.classes.paper}>
            <Typography variant='body2'>Venta efectivo: {money(calcSell(props.sells, true))}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={props.classes.paper}>
            <Typography variant='body2'>Venta pago post-fechado: {money(calcSell(props.sells, false))}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={props.classes.paper}>
            <Typography variant='subtitle2'>Productos vendidos en el día</Typography>
            <FormControl fullWidth margin='normal'>
              <InputLabel htmlFor='client-filter'>Cliente</InputLabel>
              <Select
                inputProps={{
                  id: 'client-filter',
                  name: 'clientFilter' ,
                }}
                onChange={this.handleChange('clientFilter')}
                value={state.clientFilter}
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
                        client.defaultCash ?
                        props.classes.cashAvatar : props.classes.postAvatar
                      }>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    {clientName(String(client.id))}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            {aggregateProducts(props.sells, state.clientFilter).map(([name, qty]) =>
              <Typography variant='body2' key={name}>
                {name}: {qty}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

const styles: StyleRulesCallback<Theme, Props> = theme => ({
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
})


export default withStyles(styles)(DayOverview)
