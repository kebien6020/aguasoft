import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import * as colors from '@material-ui/core/colors'

import DeleteIcon from '@material-ui/icons/Delete'

import Alert from './Alert'

import { money } from '../utils'

import * as moment from 'moment'

export interface Sell {
  Client: {name: string, id: number, defaultCash: boolean},
  Product: {name: string},
  User: {name: string; code: string},
  Prices: {name: string; value: string}[],
  cash: boolean,
  date: string,
  id: number,
  priceOverride: number,
  quantity: number,
  value: number,
  updatedAt: string,
  deleted: boolean,
}

interface SellsProps {
  sells: Sell[]
  onDeleteSell: (sellId: number) => unknown
}

const Sells = (props: SellsProps): JSX.Element => {
  const classes = useStyles()

  const getCardClass = (sell: Sell) => {
    const classNames = [classes.sellCard]

    classNames.push(sell.cash
      ? classes.sellCardCash
      : classes.sellCardPost
    )

    if (sell.deleted)
      classNames.push(classes.sellCardDeleted)

    return classNames.join(' ')
  }

  const userColorLookup : {[index:string] : string} = {
    '001': colors.blue[500],
    '002': colors.pink[500],
    '003': colors.green[500],
  }

  const getUserColor = (userCode: string) => (
    userColorLookup[userCode] || colors.grey[500]
  )

  const getBasePrice = (sell: Sell) =>
    Number(sell.Prices.filter(p => p.name === 'Base')[0].value)

  const isBasePrice = (sell: Sell) => {
    const price = sell.value / sell.quantity
    const basePrice = getBasePrice(sell)

    return Math.floor(price) === Math.floor(basePrice)
  }

  return (
    <Grid container spacing={2}>
      {props.sells && props.sells.length === 0
          && <Grid item xs={12}>
            <Typography variant='h5'>
              No se registaron ventas este día.
            </Typography>
          </Grid>
      }
      {props.sells
        ? props.sells.map((sell, key) => (
          <Grid item xs={12} key={key}>
            <Card className={getCardClass(sell)}>
              <div className={classes.cardMain}>
                <CardHeader
                  className={classes.cardHeader}
                  avatar={
                    <Avatar
                      aria-label={sell.User.name}
                      className={classes.avatar}
                      style={{ backgroundColor: getUserColor(sell.User.code) }}
                    >
                      {sell.User.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={`${sell.quantity} ${sell.Product.name}`}
                  subheader={`para ${sell.Client.name}`}
                />
                <CardContent>
                  <Typography variant='body2'>
                    {moment(sell.updatedAt).format('hh:mm a')}
                      ({moment(sell.updatedAt).fromNow()})
                  </Typography>
                  {sell.deleted
                      && <Alert type='error' message='Esta venta fue eliminada' />
                  }
                  {!isBasePrice(sell)
                      && <Alert
                        type='warning'
                        message={`Venta por un precio diferente al precio base (que es ${money(getBasePrice(sell))})`}
                      />
                  }
                </CardContent>
                <IconButton
                  className={classes.deleteButton}
                  onClick={() => props.onDeleteSell(sell.id)}
                  disabled={sell.deleted}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
              <div className={classes.cardPrices}>
                <div className={classes.cardPrice}>
                  <Typography
                    variant='overline'
                    className={classes.cardPriceHeader}>
                      Precio Unitario
                  </Typography>
                  <Typography
                    variant='caption'
                    className={classes.cardPriceValue}>
                    {money(sell.value / sell.quantity)}
                  </Typography>
                </div>
                <div className={classes.cardPrice}>
                  <Typography
                    variant='overline'
                    className={classes.cardPriceHeader}>
                      Precio Total
                  </Typography>
                  <Typography
                    variant='caption'
                    className={classes.cardPriceValue}>
                    {money(sell.value)}
                  </Typography>
                </div>
              </div>
            </Card>
          </Grid>
        ))
        : 'Cargando ventas del día...'
      }
    </Grid>
  )
}

const useStyles = makeStyles(theme => ({
  sellCard: {
    borderLeft: '5px solid ' + theme.palette.grey[500],
    display: 'flex',
    flexDirection: 'row',
  },
  sellCardCash: {
    borderLeftColor: colors.blue[500],
  },
  sellCardPost: {
    borderLeftColor: colors.deepOrange[500],
  },
  sellCardDeleted: {
    backgroundColor: colors.grey[500],
    borderLeftColor: colors.red.A700,
    '& $cardPrice': {
      backgroundColor: colors.grey[700] + ' !important',
    },
  },
  sellCardWarning: {
    backgroundColor: colors.orange[300],
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardMain: {
    flex: '3',
    position: 'relative',
  },
  cardHeader: {

  },
  cardPrices: {
    flex: '1',
  },
  cardPrice: {
    minHeight: '50%',
    textAlign: 'center',
    '&:nth-child(1)': {
      backgroundColor: colors.blue[200],
    },
    '&:nth-child(2)': {
      backgroundColor: colors.blue[400],
    },

    display: 'flex',
    flexDirection: 'column',
  },
  cardPriceHeader: {
    color: 'rgba(0, 0, 0, 0.75)',
    fontSize: '0.7rem',
    lineHeight: '0.77rem',
  },
  cardPriceValue: {
    flex: '1',
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

// See comment on component Login
export default Sells
