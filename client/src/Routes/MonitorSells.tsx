import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import { fetchJsonAuth, money } from '../utils'

import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import DeleteIcon from '@material-ui/icons/Delete'
import UpdateIcon from '@material-ui/icons/Update'

import MyDatePicker from '../components/MyDatePicker'

import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface MonitorSellsProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface MonitorSellsState {
  date: moment.Moment,
  sells: Sell[] | null,
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
      date: moment(),
      sells: null,
    }
  }

  handleDateChange = (date: moment.Moment) => {
    this.setState({date})
    this.updateContents(date)
  }

  handleClickDelete = async (sellId: number) => {
    if (!this.state.sells) return // This should never happen

    const { auth } = this.props

    const result = await fetchJsonAuth('/api/sells/' + sellId, auth, {
      method: 'delete',
    })

    if (result && result.success) {
      const sells = [...this.state.sells]
      // Guaranteed to exist
      const sell = sells.find(s => s.id === sellId) as Sell
      sell.deleted = true

      this.setState({sells})
    } else {
      console.log(result)
    }
  }

  componentWillMount() {
    this.updateContents(moment())
  }

  updateContents = async (date: moment.Moment) => {
    const { auth } = this.props
    this.setState({sells: null})
    const sells: Sell[] = await fetchJsonAuth(
      '/api/sells/listDay?day=' + date.format('YYYY-MM-DD'),
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
        <Typography variant='h6' className={classes.title}>
          Ventas del Dia
        </Typography>
        <MyDatePicker
          date={state.date}
          onDateChange={this.handleDateChange}
        />
        <Grid container spacing={3} className={classes.summary}>
          <Grid item xs={12} lg={5}>
            <Paper className={classes.paper}>
              <Typography variant='body2'>Venta efectivo: {money(this.calcSell(true))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Paper className={classes.paper}>
              <Typography variant='body2'>Venta pago post-fechado: {money(this.calcSell(false))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={2}>
            <Paper className={classes.paper}>
              <Button
                onClick={() => this.updateContents(state.date)}
                variant='contained'
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

const styles: StyleRulesCallback<Theme, MonitorSellsProps> = theme => ({
  title: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
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
    padding: theme.spacing(2),
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
