import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles'

import CircularProgress from '@material-ui/core/CircularProgress'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import * as colors from '@material-ui/core/colors'

import {
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@material-ui/icons'

import { AuthRouteComponentProps } from '../AuthRoute'
import Login from '../components/Login'
import SellList, { Sell } from '../components/Sells'
import MyDatePicker from '../components/MyDatePicker'
import DayOverview from '../components/DayOverview'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'

import * as moment from 'moment'
import { Moment } from 'moment'
import 'moment/locale/es'
moment.locale('es')

export interface ErrorSnackbarProps {
  className?: string
  message?: string
  onClose?: () => void
}

function ErrorSnackbar(props: ErrorSnackbarProps) {
  const classes = useErrorSnackbarStyles()
  const { className, message, onClose, ...other } = props

  return (
    <SnackbarContent
      className={clsx('cont', className)}
      aria-describedby='client-snackbar'
      message={
        <span id='client-snackbar' className={classes.message}>
          <ErrorIcon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key='close' aria-label='close' color='inherit' onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  )
}

const useErrorSnackbarStyles = makeStyles((theme: Theme) => ({
  cont: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}))

type SellsProps = AuthRouteComponentProps<{}>
export default function Sells(props: SellsProps) {
  const { auth } = props
  const classes = useStyles()

  // Date picker
  const [date, setDate] = useState(() => moment().startOf('day'))
  const handleDateChange = useCallback((date: Moment) => {
    setDate(date)
  }, [])
  const datePicker =
    <MyDatePicker
      date={date}
      className={classes.datePicker}
      onDateChange={handleDateChange}
      DatePickerProps={{
        inputVariant: 'outlined',
        label: 'Fecha',
      }}
    />

  // Snackbar
  const [snackbarError, setSnackbarError] = useState<string|null>(null)
  const snackbarOpen = snackbarError !== null;
  const handleSnackbarClose = useCallback(() => setSnackbarError(null), []);
  const snackbar =
    <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
      <ErrorSnackbar message={snackbarError || undefined} onClose={handleSnackbarClose} />
    </Snackbar>

  // Sell List
  const [sells, setSells] = useState<Sell[]|null>(null)
  useEffect(() => {
    const updateSells = async () => {
      const url = '/api/sells/listDay?day=' + date.format('YYYY-MM-DD')
      const sells: ErrorResponse | Sell[] =
        await fetchJsonAuth(url, auth)

      if (!isErrorResponse(sells)) {
        setSells(sells)
      } else {
        console.error(sells.error)
        setSnackbarError('Error al cargar las ventas, por favor recarga la página')
      }
    }

    updateSells()
  }, [date])

  const handleDeleteSell = useCallback(async (sellId: number) => {
    if (!sells) return

    const url = '/api/sells/' + sellId
    const result : ErrorResponse | SuccessResponse =
      await fetchJsonAuth(url, auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const sellsCopy = [...sells]
      const sell = sellsCopy.find(s => s.id === sellId)
      if (!sell) {
        console.error('Trying to mutate unknown sellId', sellId)
        return
      }
      sell.deleted = true

      setSells(sellsCopy)
    } else {
      console.error(result)
    }
  }, [sells, auth])

  const sellList =
    sells && <SellList
       sells={sells}
       onDeleteSell={handleDeleteSell}
    />

  // Login to register sell
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/sell')
  }, [history])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} auth={auth} />
    </Paper>

  return (
    <Layout title='Ventas' className={classes.layout}>
      <Title>Registrar Venta</Title>
      {loginElem}

      {datePicker}

      <Title>Resumen</Title>
      {sells ?
        <DayOverview sells={sells} /> :
        <CircularProgress />
      }

      <Title>Ventas del Día</Title>
      {sells ?
        sellList :
        <CircularProgress />
      }

      {snackbar}
    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  layout: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '95%',
    [theme.breakpoints.up('md')]: { width: '90%', },
    [theme.breakpoints.up('lg')]: { width: '80%', },
    [theme.breakpoints.up('xl')]: { width: '75%', },
  },
  login: {
    padding: theme.spacing(2),
  },
  bottomSection: {
    // Put summary on top of sells on small screens
    flexDirection: 'column-reverse',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  sidebarElement: {
    width: '90%',
    padding: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
  datePicker: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(0),
  },
  others: {
    display: 'flex',
    justifyItems: 'start',
    padding: theme.spacing(1),
  },
  icon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    color: colors.green[500],
    borderColor: colors.green[500],
    marginRight: theme.spacing(1),
    '& svg': {
      fontSize: theme.spacing(8),
    }
  },
  spendingIcon: {
    color: colors.blue['A700'],
    borderColor: colors.blue['A700'],
  },
  seeMoreContainer: {
    paddingTop: '8px',
    paddingBottom: '8px',
    textAlign: 'center',
  },
}))
