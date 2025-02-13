import { Theme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { fetchJsonAuth, money, isErrorResponse, formatDateCol, parseDateonlyMachine } from '../utils'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import DeleteIcon from '@mui/icons-material/Delete'
import UpdateIcon from '@mui/icons-material/Update'

import MyDatePicker from '../components/MyDatePicker'

import { Component } from 'react'
import { formatDateonlyMachine } from '../utils/dates'
import { format, isSameDay } from 'date-fns'
import useAuth from '../hooks/useAuth'
import type Auth from '../Auth'

type MonitorSellsProps = PropClasses & {
  auth: Auth
}

interface MonitorSellsState {
  date: Date,
  sells: Sell[] | null,
}

interface Sell {
  Client: { name: string },
  Product: { name: string },
  User: { name: string },
  cash: boolean,
  date: string,
  id: number,
  priceOverride: number,
  quantity: number,
  value: number,
  updatedAt: string,
  deleted: boolean
}

class MonitorSells extends Component<MonitorSellsProps, MonitorSellsState> {

  constructor(props: MonitorSellsProps) {
    super(props)
    this.state = {
      date: new Date,
      sells: null,
    }
  }

  handleDateChange = (date: Date) => {
    this.setState({ date })
    void this.updateContents(date)
  }

  handleClickDelete = async (sellId: number) => {
    if (!this.state.sells) return // This should never happen

    const { auth } = this.props

    const result = await fetchJsonAuth(`/api/sells/${sellId}`, auth, {
      method: 'delete',
    })

    if (result && result.success) {
      const sells = [...this.state.sells]
      // Guaranteed to exist
      const sell = sells.find(s => s.id === sellId) as Sell
      sell.deleted = true

      this.setState({ sells })
    } else {
      console.log(result)
    }
  }

  componentDidMount() {
    void this.updateContents(new Date)
  }

  updateContents = async (date: Date) => {
    const { auth } = this.props
    this.setState({ sells: null })
    const sells = await fetchJsonAuth<Sell[]>(
      '/api/sells/listDay?day=' + formatDateonlyMachine(date),
      auth
    )

    if (isErrorResponse(sells))
      return


    this.setState({ sells })
  }

  calcSell = (cash: boolean): number => {
    if (!this.state.sells) return 0
    return this.state.sells.reduce((acc, sell) => {
      if (sell.cash === cash && !sell.deleted)
        return acc + sell.value

      return acc
    }, 0)
  }

  render() {
    const { props, state } = this
    const { classes } = props
    return (
      (<>
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
              <TableCell>{/* Eliminar*/}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              state.sells
                ? state.sells.map((sell, key) => (
                  <TableRow key={key} className={classes.row + (sell.deleted ? ' disabled' : '')}>
                    <TableCell>{formatDateCol(parseDateonlyMachine(sell.date))}</TableCell>
                    <TableCell>{sell.Product.name}</TableCell>
                    <TableCell>{sell.Client.name}</TableCell>
                    <TableCell>{sell.cash ? 'si' : 'no'}</TableCell>
                    <TableCell>{money(sell.value / sell.quantity)}</TableCell>
                    <TableCell>{sell.quantity}</TableCell>
                    <TableCell>{money(sell.value)}</TableCell>
                    <TableCell>{sell.User.name}</TableCell>
                    <TableCell>{
                      (isSameDay(parseDateonlyMachine(sell.date), new Date(sell.updatedAt))
                        ? ''
                        : formatDateCol(parseDateonlyMachine(sell.date)) + ' '
                        + format(new Date(sell.updatedAt), 'HH:mm a'))
                    }</TableCell>
                    <TableCell>
                      <IconButton
                        className={classes.deleteButton}
                        onClick={() => this.handleClickDelete(sell.id)}
                        disabled={sell.deleted}
                        size="large">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} style={{ textAlign: 'center' }}>
                      Cargando...
                    </TableCell>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
      </>)
    )
  }
}

const MonitorSellsWrapper = () => {
  const auth = useAuth()
  const classes = useStyles()

  return <MonitorSells classes={classes} auth={auth} />
}

const useStyles = makeStyles((theme: Theme) => ({
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
}))

export default MonitorSellsWrapper
