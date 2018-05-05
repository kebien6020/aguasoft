import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'
import { isSameDay } from 'date-fns'

import Typography from 'material-ui/Typography'
import Table, { TableRow, TableCell, TableHead, TableBody } from 'material-ui/Table'
import DatePicker from 'material-ui-pickers/DatePicker'

interface MonitorSellsProps extends PropClasses, AuthRouteComponentProps<{}> {

}

class MonitorSells extends React.Component<MonitorSellsProps> {
  state = {
    date: new Date()
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

  updateContents = (date: Date) => {
    console.log('update table to date', date)
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
            format='DD-MMM-YY'
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

            <TableRow>
              <TableCell colSpan={8} style={{textAlign: 'center'}}>
                Cargando...
              </TableCell>
            </TableRow>
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
