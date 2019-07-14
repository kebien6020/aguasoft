import * as React from 'react'
import * as moment from 'moment'

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core'

import {
  withStyles,
  StyleRulesCallback,
  Theme,
} from '@material-ui/core/styles'

import {
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@material-ui/icons'

import * as colors from '@material-ui/core/colors'

import Alert from '../components/Alert'
import { Spending } from '../models'
import { money } from '../utils'

interface Props extends PropClasses {
  spendings: Spending[]
  onDeleteSpending: (spendingId: number) => any
}

class Spendings extends React.Component<Props> {
  render() {
    const { props } = this
    const { classes } = props

    const deletedInfo = (deletedAt: string) => {
      const timestamp = moment(deletedAt)
      const date = timestamp.format('DD-MMM-YYYY')
      const time = timestamp.format('hh:mm a')
      return `Este pago fue eliminado el ${date} a las ${time}.`
    }

    const getCardClass = (spending: Spending) => {
      const classNames: String[] = [classes.card]

      if (spending.deletedAt !== null)
        classNames.push(classes.cardDeleted)

      return classNames.join(' ')
    }

    return (
      <Grid container spacing={16}>
        {props.spendings && props.spendings.length === 0 &&
          <Grid item xs={12}>
            <Typography variant='body1'>
              No se registaron salidas este día.
            </Typography>
          </Grid>
        }
        {props.spendings.map((spending, idx) =>
          <Grid item key={idx} xs={12}>
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
                    Fecha salida: {moment(spending.date).format('DD/MMM/YYYY')}
                  </Typography>
                  <Divider />
                  <Typography variant='body2'>
                    Registrado por {spending.User.name}
                  </Typography>
                  <Divider />
                  <Typography variant='body2'>
                    Registrado el: {moment(spending.updatedAt).format('DD/MM/YYYY hh:mm a') + ' '}
                    ({moment(spending.updatedAt).fromNow()})
                  </Typography>
                  {spending.deletedAt !== null &&
                    <Alert
                      type='error'
                      message={deletedInfo(spending.deletedAt)}
                    />
                  }
                </CardContent>
                <IconButton
                  className={classes.deleteButton}
                  onClick={() => props.onDeleteSpending(spending.id)}
                  disabled={spending.deletedAt !== null}
                >
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
          </Grid>
        )}
      </Grid>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'row',
  },
  cardDeleted: {
    backgroundColor: colors.grey[500],
    borderLeftColor: colors.red['A700'],
    '& $cardPrice, & $cardPriceHeader': {
      backgroundColor: colors.grey[700] + ' !important',
    },
  },
  avatar: {
    backgroundColor: colors.blue['A700'],
    color: theme.palette.primary.contrastText,
  },
  cardMain: {
    flex: '3',
    position: 'relative',
  },
  cardHeader: { },
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
})

export default withStyles(styles)(Spendings)
