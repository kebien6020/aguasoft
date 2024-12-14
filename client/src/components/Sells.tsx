import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import * as colors from '@material-ui/core/colors'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import moment from 'moment'
import * as React from 'react'
import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import { fetchJsonAuth, isErrorResponse, money } from '../utils'
import Alert from './Alert'

export interface Sell {
  Client: { name: string, id: number, defaultCash: boolean },
  Product: { name: string },
  User: { name: string; code: string },
  Prices: { name: string; value: string }[],
  cash: boolean,
  date: string,
  id: number,
  priceOverride: number,
  quantity: number,
  value: number,
  updatedAt: string,
  deleted: boolean,
}

interface SaleCardProps {
  sale: Sell
  refresh: () => unknown
  disableDelete?: boolean
}

const SaleCard = ({ sale, refresh, disableDelete: externalDisableDelete = false }: SaleCardProps) => {
  const classes = useStyles()

  const showSnackbar = useSnackbar()
  const auth = useAuth()
  const [disableDelete, setDisableDelete] = useState(false)

  const handleDeleteSell = async (sellId: number) => {
    const url = `/api/sells/${sellId}`

    setDisableDelete(true)
    let result
    try {
      result = await fetchJsonAuth(url, auth, {
        method: 'delete',
      })
    } catch (error) {
      const msg =
        'Error de conexión al eliminar la venta. Es posible que no '
        + 'haya conexión a internet en este momento'
      showSnackbar(msg)
      return
    } finally {
      setDisableDelete(false)
    }

    if (isErrorResponse(result)) {
      showSnackbar('Error al eliminar la venta: ' + result.error.message)
      console.error(result)
      return
    }

    showSnackbar('✔ Venta eliminada')
    refresh()
  }

  const getCardClass = (sale: Sell) => {
    const classNames = [classes.sellCard]

    classNames.push(sale.cash
      ? classes.sellCardCash
      : classes.sellCardPost
    )

    if (sale.deleted)
      classNames.push(classes.sellCardDeleted)

    return classNames.join(' ')
  }

  const userColorLookup: { [index: string]: string } = {
    '001': colors.blue[500],
    '002': colors.pink[500],
    '003': colors.green[500],
  }

  const getUserColor = (userCode: string) => (
    userColorLookup[userCode] || colors.grey[500]
  )

  const effectiveDisableDelete =
    sale.deleted
    || disableDelete
    || externalDisableDelete

  return (
    <Card className={getCardClass(sale)}>
      <div className={classes.cardMain}>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Avatar
              aria-label={sale.User.name}
              className={classes.avatar}
              style={{ backgroundColor: getUserColor(sale.User.code) }}
            >
              {sale.User.name.charAt(0).toUpperCase()}
            </Avatar>
          }
          title={`${sale.quantity} ${sale.Product.name}`}
          subheader={`para ${sale.Client.name}`}
        />
        <CardContent>
          <Typography variant='body2'>
            {moment(sale.updatedAt).format('hh:mm a')}
            ({moment(sale.updatedAt).fromNow()})
          </Typography>
          {sale.deleted && <>
            <Alert type='error' message='Esta venta fue eliminada' />
          </>}
          <BasePriceAlert sale={sale} />
        </CardContent>
        <IconButton
          className={classes.deleteButton}
          onClick={() => handleDeleteSell(sale.id)}
          disabled={effectiveDisableDelete}
        >
          <DeleteIcon />
        </IconButton>
      </div>
      <div className={classes.cardPrices}>
        <div className={classes.cardPrice}>
          <Typography
            variant='overline'
            className={classes.cardPriceHeader}
          >
            Precio Unitario
          </Typography>
          <Typography
            variant='caption'
            className={classes.cardPriceValue}
          >
            {money(sale.value / sale.quantity)}
          </Typography>
        </div>
        <div className={classes.cardPrice}>
          <Typography
            variant='overline'
            className={classes.cardPriceHeader}
          >
            Precio Total
          </Typography>
          <Typography
            variant='caption'
            className={classes.cardPriceValue}
          >
            {money(sale.value)}
          </Typography>
        </div>
      </div>
    </Card>
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

interface SellsProps {
  sells: Sell[]
  refresh: () => unknown
  disableDelete?: boolean
}

const Sells = ({ sells, refresh, disableDelete = false }: SellsProps): JSX.Element => (
  <Grid container spacing={2}>
    {sells?.length === 0 && <>
      <Grid item xs={12}>
        <Typography variant='h5'>
          No se registaron ventas este día.
        </Typography>
      </Grid>
    </>}
    {sells
      ? sells.map(sale => (
        <Grid item xs={12} key={sale.id}>
          <SaleCard sale={sale} refresh={refresh} disableDelete={disableDelete} />
        </Grid>
      ))
      : 'Cargando ventas del día...'
    }
  </Grid>
)

const getBasePrice = (sale: Sell) => {
  const basePriceObj = sale.Prices.find(p => p.name === 'Base')
  if (basePriceObj === undefined)
    return undefined

  return Number(basePriceObj.value)
}

const BasePriceAlert = ({ sale }: { sale: Sell }) => {
  const basePrice = getBasePrice(sale)
  if (basePrice === undefined) {
    return (
      <Alert
        type='error'
        message='No se encontró el precio base de este producto'
      />
    )
  }

  const price = sale.value / sale.quantity
  const isBasePrice = Math.floor(price) === Math.floor(basePrice)

  if (!isBasePrice) {
    return (
      <Alert
        type='warning'
        message={`Venta por un precio diferente al precio base (que es ${money(basePrice)})`}
      />
    )
  }

  return null
}


// See comment on component Login
export default Sells
