import { useState } from 'react'

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'

import makeStyles from '@mui/styles/makeStyles'

import {
  Delete as DeleteIcon,
} from '@mui/icons-material'

import * as colors from '@mui/material/colors'

import Alert from '../components/Alert'
import { Payment } from '../models'
import { formatDateCol, formatTimeonlyCol, money, parseDateonlyMachine } from '../utils'
import { intlFormatDistance } from 'date-fns'
import { Theme } from '../theme'

interface Props {
  payments: Payment[]
  onDeletePayment: (paymentId: number) => Promise<unknown>
  deleteDisabled?: boolean
}

const Payments = (props: Props): JSX.Element => {
  const classes = useStyles()

  const invoiceInfo = (payment: Payment) => {
    if (payment.invoiceDate === null || payment.invoiceNo === null)
      return null

    const date = formatDateCol(parseDateonlyMachine(payment.invoiceDate))
    const no = payment.invoiceNo

    return `Factura No. ${no} del ${date}`
  }

  const dateInfo = (payment: Payment) => {
    if (payment.dateFrom === null || payment.dateTo === null)
      return null

    const from = formatDateCol(parseDateonlyMachine(payment.dateFrom))
    const to = formatDateCol(parseDateonlyMachine(payment.dateTo))

    return `Desde el ${from} hasta el ${to}`
  }

  const deletedInfo = (deletedAt: string) => {
    const timestamp = new Date(deletedAt)
    const date = formatDateCol(timestamp)
    const time = formatTimeonlyCol(timestamp)
    return `Este pago fue eliminado el ${date} a las ${time}.`
  }

  const getCardClass = (payment: Payment) => {
    const classNames: string[] = [classes.card]

    if (payment.deletedAt !== null)
      classNames.push(classes.cardDeleted)

    return classNames.join(' ')
  }

  const [disabledDelete, setDisabledDelete] = useState<string | null>(null) // payment id

  return (
    (<Grid container spacing={2}>
      {props.payments && props.payments.length === 0
        && <Grid item xs={12}>
          <Typography variant='body1'>
            No se registaron pagos este día.
          </Typography>
        </Grid>
      }
      {props.payments.map((payment, idx) =>
        <Grid item key={idx} xs={12}>
          <Card className={getCardClass(payment)}>
            <div className={classes.cardMain}>
              <CardHeader
                className={classes.cardHeader}
                title={payment.Client.name}
                avatar={
                  <Avatar
                    className={classes.avatar}
                  >
                    $
                  </Avatar>
                }
              />
              <CardContent>
                {payment.invoiceDate && payment.invoiceNo
                  && <>
                    <Typography variant='body2'>
                      {invoiceInfo(payment)}
                    </Typography>
                    <Divider />
                  </>
                }
                {payment.dateFrom && payment.dateTo
                  && <>
                    <Typography variant='body2'>
                      {dateInfo(payment)}
                    </Typography>
                    <Divider />
                  </>
                }
                <Typography variant='body2'>
                  Registrado por {payment.User.name}
                </Typography>
                <Divider />
                <Typography variant='body2'>
                  Pagado el: {formatDateCol(new Date(payment.date))}
                </Typography>
                <Divider />
                <Typography variant='body2'>
                  {formatTimeonlyCol(new Date(payment.updatedAt)) + ' '}
                  ({intlFormatDistance(new Date(payment.updatedAt), new Date(), { locale: 'es' })})
                </Typography>
                {payment.deletedAt !== null
                  && <Alert
                    type='error'
                    message={deletedInfo(payment.deletedAt)}
                  />
                }
              </CardContent>
              <IconButton
                className={classes.deleteButton}
                onClick={() => {
                  (async () => {
                    try {
                      setDisabledDelete(String(payment.id))
                      await props.onDeletePayment(payment.id)
                    } finally {
                      setDisabledDelete(null)
                    }
                  })()
                }}
                disabled={
                  payment.deletedAt !== null
                  || String(payment.id) === disabledDelete
                  || props.deleteDisabled
                }
                size="large">
                <DeleteIcon />
              </IconButton>
            </div>
            <div className={classes.cardPrices}>
              <Typography
                variant='overline'
                className={classes.cardPriceHeader}>
                Cantidad Pagada
              </Typography>
              <div className={classes.cardPrice}>
                <Typography
                  variant='caption'
                  className={classes.cardPriceValue}>
                  {money(payment.value)}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
      )}
    </Grid>)
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'row',
  },
  cardDeleted: {
    backgroundColor: colors.grey[500],
    borderLeftColor: colors.red.A700,
    '& $cardPrice, & $cardPriceHeader': {
      backgroundColor: colors.grey[700] + ' !important',
    },
  },
  avatar: {
    backgroundColor: colors.green[500],
    color: theme.palette.primary.contrastText,
  },
  cardMain: {
    flex: '3',
    position: 'relative',
  },
  cardHeader: {},
  cardPrices: {
    flex: '1',

    textAlign: 'center',

    display: 'flex',
    flexDirection: 'column',
  },
  cardPriceHeader: {
    display: 'block',
    backgroundColor: colors.blue[200],
    color: 'rgba(0, 0, 0, 0.75)',
    fontSize: '0.7rem',
    lineHeight: '0.77rem',
  },
  cardPrice: {
    flex: '1',

    backgroundColor: colors.blue[400],

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardPriceValue: {
    display: 'block',
    fontSize: '1.75rem',
    lineHeight: '3.5rem',
  },
  deleteButton: {
    color: 'red',
    position: 'absolute',
    bottom: '0',
    right: '0',
  },
}))

export default Payments
