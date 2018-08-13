import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'
import { isSameDay } from 'date-fns'
import { fetchJsonAuth } from '../utils'

import Typography from 'material-ui/Typography'
import Table, { TableRow, TableCell, TableHead, TableBody } from 'material-ui/Table'
import DatePicker from 'material-ui-pickers/DatePicker'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from 'material-ui-icons/Delete'

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
    if (!isSameDay(date, this.state.date)) {
      this.setState({date})
      this.updateContents(date)
    }
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

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      <React.Fragment>
        <Typography variant='title' className={classes.title}>
          Ventas del Dia
        </Typography>
        <div className={classes.datePickerContainer}>
          <DatePicker
            className={classes.datePicker}
            value={state.date}
            format='D-MMM-YYYY'
            disableFuture
            onChange={this.handleDateChange}
          />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Efectivo</TableCell>
              <TableCell>Precio Especial</TableCell>
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
                  <TableCell>{sell.priceOverride || ''}</TableCell>
                  <TableCell>{sell.quantity}</TableCell>
                  <TableCell>{sell.value}</TableCell>
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
  datePickerContainer: {
    display: 'block',
    textAlign: 'center',
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 2,
  },
  datePicker: {
    '& input': {
      textAlign: 'center',
    },
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
})

export default withStyles(styles)(MonitorSells)
