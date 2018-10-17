import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'
import { fetchJsonAuth, money } from '../utils'

import Typography from 'material-ui/Typography'
import Table, { TableRow, TableCell, TableHead, TableBody } from 'material-ui/Table'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from 'material-ui-icons/Delete'
import Button from 'material-ui/Button'
import UpdateIcon from 'material-ui-icons/Update'
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'

import MyDatePicker from '../components/MyDatePicker'

import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface MonitorSellsProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface MonitorSellsState {
  date: Date,
  sells: Sell[],
}

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

class MonitorSells extends React.Component<MonitorSellsProps, MonitorSellsState> {

  constructor(props: MonitorSellsProps) {
    super(props)
    this.state = {
      date: new Date(),
      sells: null,
    }
  }

  handleDateChange = (date: Date) => {
    this.setState({date})
    this.updateContents(date)
  }

  handleClickDelete = async (sellId: number) => {
    const { auth } = this.props

    const result = await fetchJsonAuth('/api/sells/' + sellId, auth, {
      method: 'delete',
    })

    if (result && result.success) {
      const sells = [...this.state.sells]
      const sell = sells.find(s => s.id === sellId)
      sell.deleted = true

      this.setState({sells})
    } else {
      console.log(result)
    }
  }

  componentWillMount() {
    this.updateContents(new Date())
  }

  updateContents = async (date: Date) => {
    const { auth } = this.props
    this.setState({sells: null})
    const sells: Sell[] = await fetchJsonAuth(
      '/api/sells/listDay?day=' + moment(date).format('YYYY-MM-DD'),
      auth
    )

    this.setState({sells})
  }

  calcSell = (cash: boolean) : number => {
    if (!this.state.sells) return 0
    return this.state.sells.reduce((acc, sell) => {
      if (sell.cash === cash && !sell.deleted) {
        return acc + sell.value
      }
      return acc
    }, 0)
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <React.Fragment>
        <Typography variant='title' className={classes.title}>
          Ventas del Dia
        </Typography>
        <MyDatePicker
          date={state.date}
          onDateChange={this.handleDateChange}
        />
        <Grid container spacing={24} className={classes.summary}>
          <Grid item xs={12} lg={5}>
            <Paper className={classes.paper}>
              <Typography variant='body1'>Venta efectivo: {money(this.calcSell(true))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Paper className={classes.paper}>
              <Typography variant='body1'>Venta pago post-fechado: {money(this.calcSell(false))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={2}>
            <Paper className={classes.paper}>
              <Button
                onClick={() => this.updateContents(state.date)}
                variant='raised'
                color='secondary'
                className={classes.updateButton}
              >
                Actualizar <UpdateIcon />
              </Button>
            </Paper>
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Efectivo</TableCell>
              <TableCell>Precio Unitario</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Registrado por</TableCell>
              <TableCell>Registrado en</TableCell>
              <TableCell>{/*Eliminar*/}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              state.sells ?
              state.sells.map((sell, key) => (
                <TableRow key={key} className={classes.row + (sell.deleted ? ' disabled' : '')}>
                  <TableCell>{moment(sell.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</TableCell>
                  <TableCell>{sell.Product.name}</TableCell>
                  <TableCell>{sell.Client.name}</TableCell>
                  <TableCell>{sell.cash ? 'si' : 'no'}</TableCell>
                  <TableCell>{money(sell.value / sell.quantity)}</TableCell>
                  <TableCell>{sell.quantity}</TableCell>
                  <TableCell>{money(sell.value)}</TableCell>
                  <TableCell>{sell.User.name}</TableCell>
                  <TableCell>{
                    (moment(sell.date).isSame(sell.updatedAt, 'day')
                     ? ''
                     : moment(sell.date).format('DD-MMM-YYYY '))
                    + moment(sell.updatedAt).format('hh:mm a')
                  }</TableCell>
                  <TableCell>
                    <IconButton
                      className={classes.deleteButton}
                      onClick={() => this.handleClickDelete(sell.id)}
                      disabled={sell.deleted}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} style={{textAlign: 'center'}}>
                    Cargando...
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </React.Fragment>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.unit * 2,
  },
  deleteButton: {
    color: 'red',
  },
  row: {
    '&.disabled > td': {
      color: 'gray',
      textDecoration: 'line-through',
    },
  },
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
  updateButton: {
    fontSize: '16px',
  },
})

export default withStyles(styles)(MonitorSells)
