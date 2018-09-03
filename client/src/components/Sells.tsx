import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'

import { fetchJsonAuth, money } from '../utils'
import Auth from '../Auth'

import { Moment } from 'moment'
import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface Sell {
  Client: {name: string},
  Product: {name: string},
  User: {name: string},
  cash: boolean,
  date: string,
  id: number,
  priceOverride: number,
  quantity: number,
  value: number,
  updatedAt: string,
  deleted: boolean
}

interface SellsState {
  sells?: Sell[]
}

interface SellsProps {
  day: Moment
  auth: Auth
}

type SellsPropsAll = SellsProps & PropClasses

class Sells extends React.Component<SellsPropsAll, SellsState> {
  componentWillMount() {
    this.updateContents(this.props.day)
  }

  updateContents = async (date: Moment) => {
    const { auth } = this.props
    this.setState({sells: null})
    const sells: Sell[] = await fetchJsonAuth(
      '/api/sells/listDay?day=' + date.format('YYYY-MM-DD'),
      auth
    )

    this.setState({sells})
  }

  render() {
    const { state } = this
    // const { classes } = this.props

    return (
      <Grid container spacing={16}>
        {state.sells ?
          state.sells.map((sell, key) => (
            <Grid item xs={12} key={key}>
              <Paper>
                <Typography variant='subheading'>
                  {sell.quantity} {sell.Product.name}
                </Typography>
                para {sell.Client.name}
                Vendedor: {sell.User.name}
                Precio Unitario: {money(sell.value / sell.quantity)}
                Precio Total: {money(sell.value)}
              </Paper>
            </Grid>
          ))
          : 'Cargando ventas del día...'
        }
      </Grid>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  // CSS here
})

// See comment on component Login
export default withStyles(styles)<SellsProps>(Sells)
