import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import { money } from '../utils'
import { Sell } from './Sells'

import {
  Grid,
  Paper,
  Typography,
} from '@material-ui/core'



interface DayOverviewProps extends PropClasses {
  sells: Sell[]
}

const calcSell = (sells: Sell[], cash: boolean) : number => {
  return sells.reduce((acc, sell) => {
    if (sell.cash === cash && !sell.deleted) {
      return acc + sell.value
    }
    return acc
  }, 0)
}

const aggregateProducts = (sells: Sell[]) => {
  const productNames = sells
    .map(s => s.Product.name)
    .filter((p, idx, self) => self.indexOf(p) === idx)

  const countProd = (sells: Sell[], pn: string) =>
    sells
      .filter(s => s.Product.name === pn)
      .reduce((acc, s) => acc + s.quantity, 0)

  return productNames
    .map(pn => [pn, countProd(sells, pn)] as [string, number])
}

const DayOverview = (props : DayOverviewProps) => (

  <Grid container spacing={24} className={props.classes.summary}>
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
        {aggregateProducts(props.sells).map(([name, qty]) =>
          <Typography variant='body2' key={name}>
            {name}: {qty}
          </Typography>
        )}
      </Paper>
    </Grid>
  </Grid>
)

const styles: StyleRulesCallback = (theme: Theme) => ({
  summary: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
})


export default withStyles(styles)(DayOverview)
