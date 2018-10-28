import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

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

import { fetchJsonAuth, money } from '../utils'
import Auth from '../Auth'

import { Moment } from 'moment'
import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

export interface Sell {
  Client: {name: string},
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

interface SellsState {
  sells?: Sell[]
}

interface SellsProps {
  day: Moment
  auth: Auth

  onSellsChanged?: (sells: Sell[]) => any
}

type SellsPropsAll = SellsProps & PropClasses

class Sells extends React.Component<SellsPropsAll, SellsState> {
  componentWillMount() {
    this.updateContents(this.props.day)
  }

  componentWillReceiveProps(props: SellsPropsAll) {
    this.updateContents(props.day)
  }

  updateContents = async (date: Moment) => {
    const { auth } = this.props
    this.setState({sells: null})
    const sells: Sell[] = await fetchJsonAuth(
      '/api/sells/listDay?day=' + date.format('YYYY-MM-DD'),
      auth
    )

    this.setState({sells})

    if (this.props.onSellsChanged)
      this.props.onSellsChanged(sells)
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
      console.error(result)
    }
  }

  render() {
    const { state } = this
    const { classes } = this.props

    const getCardClass = (sell: Sell) => {
      const classNames: String[] = [classes.sellCard]

      classNames.push(sell.cash ?
        classes.sellCardCash :
        classes.sellCardPost
      )

      if (sell.deleted)
        classNames.push(classes.sellCardDeleted)

      return classNames.join(' ')
    }

    const userColorLookup : {[index:string] : string} = {
      '001': colors.blue[500],
      '002': colors.green[500],
      '003': colors.pink[500],
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
      <Grid container spacing={16}>
        {state.sells && state.sells.length === 0 &&
          <Grid item xs={12}>
            <Typography variant='h5'>
              No se registaron ventas este día.
            </Typography>
          </Grid>
        }
        {state.sells ?
          state.sells.map((sell, key) => (
            <Grid item xs={12} key={key}>
              <Card className={getCardClass(sell)}>
                <div className={classes.cardMain}>
                  <CardHeader
                    className={classes.cardHeader}
                    avatar={
                      <Avatar
                        aria-label={sell.User.name}
                        className={classes.avatar}
                        style={{backgroundColor: getUserColor(sell.User.code)}}
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
                    {sell.deleted &&
                      <Alert type='error' message='Esta venta fue eliminada' />
                    }
                    {!isBasePrice(sell) &&
                      <Alert
                        type='warning'
                        message={`Venta por un precio diferente al precio base (que es ${money(getBasePrice(sell))})`}
                      />
                    }
                  </CardContent>
                  <IconButton
                    className={classes.deleteButton}
                    onClick={() => this.handleClickDelete(sell.id)}
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
}

const styles: StyleRulesCallback = (theme: Theme) => ({
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
    borderLeftColor: colors.red['A700'],
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
    flexDirection: 'column'
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
})

// See comment on component Login
export default withStyles(styles)(Sells)
