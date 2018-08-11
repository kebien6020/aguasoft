import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'
import { isSameDay } from 'date-fns'
import { fetchJsonAuth } from '../utils'

import Typography from 'material-ui/Typography'
import Table, { TableRow, TableCell, TableHead, TableBody } from 'material-ui/Table'
import DatePicker from 'material-ui-pickers/DatePicker'

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
            </TableRow>
          </TableHead>
          <TableBody>
            {
              state.sells ?
              state.sells.map((sell, key) => (
                <TableRow key={key}>
                  <TableCell>{moment(sell.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</TableCell>
                  <TableCell>{sell.Product.name}</TableCell>
                  <TableCell>{sell.Client.name}</TableCell>
                  <TableCell>{sell.cash ? 'si' : 'no'}</TableCell>
                  <TableCell>{sell.priceOverride || ''}</TableCell>
                  <TableCell>{sell.quantity}</TableCell>
                  <TableCell>{sell.value}</TableCell>
                  <TableCell>{sell.User.name}</TableCell>
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
})

export default withStyles(styles)(MonitorSells)
