import type { JSX } from 'react'
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid2 as Grid,
  IconButton,
  Typography,
} from '@mui/material'
import * as colors from '@mui/material/colors'
import makeStyles from '@mui/styles/makeStyles'
import {
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material'
import Alert from '../components/Alert'
import { Spending } from '../models'
import { formatDateCol, formatDatetimeCol, formatTimeonlyCol, money } from '../utils'
import { intlFormatDistance, isSameDay } from 'date-fns'
import { Theme } from '../theme'

interface Props {
  spendings: Spending[]
  onDeleteSpending: (spendingId: number) => unknown
}

const Spendings = (props: Props): JSX.Element => {
  const classes = useStyles()

  const deletedInfo = (deletedAt: string) => {
    const timestamp = new Date(deletedAt)
    const date = formatDateCol(timestamp)
    const time = formatTimeonlyCol(timestamp)
    return `Esta salida fue eliminada el ${date} a las ${time}.`
  }

  const getCardClass = (spending: Spending) => {
    const classNames: string[] = [classes.card]

    if (spending.deletedAt !== null)
      classNames.push(classes.cardDeleted)

    return classNames.join(' ')
  }

  return (
    (<Grid container spacing={2}>
      {props.spendings && props.spendings.length === 0
        && <Grid size={{ xs: 12 }}>
          <Typography variant='body1'>
            No se registaron salidas este día.
          </Typography>
        </Grid>
      }
      {props.spendings.map((spending, idx) =>
        <Grid key={idx} size={{ xs: 12 }}>
          <Card className={getCardClass(spending)}>
            <div className={classes.cardMain}>
              <CardHeader
                className={classes.cardHeader}
                title={spending.description}
                avatar={
                  <Avatar
                    className={classes.avatar}
                  >
                    <CartIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Typography variant='body2'>
                  Fecha salida: {formatDateCol(new Date(spending.date))}
                </Typography>
                <Divider />
                <Typography variant='body2'>
                  Registrado por {spending.User.name}
                </Typography>
                <Divider />
                <Typography variant='body2'>
                  Registrado el: {formatDatetimeCol(new Date(spending.updatedAt)) + ' '}
                  ({intlFormatDistance(new Date(spending.updatedAt), new Date, { locale: 'es' })})
                </Typography>
                {isSameDay(new Date(spending.date), new Date)
                  && <Alert
                    type='success'
                    message='Salida de hoy'
                  />
                }
                {spending.deletedAt !== null
                  && <Alert
                    type='error'
                    message={deletedInfo(spending.deletedAt)}
                  />
                }
              </CardContent>
              <IconButton
                className={classes.deleteButton}
                onClick={() => props.onDeleteSpending(spending.id)}
                disabled={spending.deletedAt !== null}
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
                  {money(Number(spending.value))}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>,
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
    backgroundColor: colors.blue.A700,
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

export default Spendings
