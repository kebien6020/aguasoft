import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import * as colors from '@material-ui/core/colors'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import { Moment } from 'moment'
import * as moment from 'moment'

import BorderedCard from '../components/BorderedCard'
import CardHeader from '../components/CardHeader'
import DateControl from '../components/controls/DateControl'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { money, moneySign, fetchJsonAuth, isErrorResponse, paramsToString, Params } from '../utils'
import useAuth from '../hooks/useAuth'
import { BalanceVerification } from '../models'
import useSnackbar from '../hooks/useSnackbar'
import LoadingIndicator from '../components/LoadingIndicator'
import useDeepCompareEffect from 'use-deep-compare-effect'
import adminOnly from '../hoc/adminOnly'

type CardPricesProps = {
  titleOne: React.ReactNode
  titleTwo: React.ReactNode
  valueOne: number
  valueTwo: number
  className?: string
}

const CardPrices = (props: CardPricesProps) => {
  const {
    titleOne,
    titleTwo,
    valueOne,
    valueTwo,
    className,
  } = props
  const classes = useCardPricesStyles()

  return (
    <div className={clsx(classes.cardPrices, className)}>
      <div className={classes.cardPrice}>
        <Typography
          variant='overline'
          className={classes.cardPriceHeader}>
          {titleOne}
        </Typography>
        <Typography
          variant='caption'
          className={classes.cardPriceValue}>
          {moneySign(valueOne)}
        </Typography>
      </div>
      <div className={classes.cardPrice}>
        <Typography
          variant='overline'
          className={classes.cardPriceHeader}>
          {titleTwo}
        </Typography>
        <Typography
          variant='caption'
          className={classes.cardPriceValue}>
          {money(valueTwo)}
        </Typography>
      </div>
    </div>
  )
}

const useCardPricesStyles = makeStyles({
  cardPrices: {
    display: 'flex',
    flexFlow: 'row',
  },
  cardPrice: {
    textAlign: 'center',
    '&:nth-child(1)': {
      backgroundColor: colors.blue[200],
    },
    '&:nth-child(2)': {
      backgroundColor: colors.blue[400],
    },

    display: 'flex',
    flexDirection: 'column',
    flex: '1',
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
    paddingLeft: '2rem',
    paddingRight: '2rem',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

type HistoryElementCardProps = {
  header: string
  content: React.ReactNode
  delta: number
  balance: number
}

const HistoryElementCard = (props: HistoryElementCardProps) => {
  // TODO: Receive a history element instead
  const { header, content, delta, balance } = props
  const classes = useHistoryElementCardStyles()

  return (
    <BorderedCard className={classes.layout}>
      <CardHeader title={header} />
      <div className={classes.body}>
        <CardContent className={classes.content}>
          {content}
        </CardContent>
        <CardPrices
          titleOne='Cambio'
          valueOne={delta}
          titleTwo='Balance'
          valueTwo={balance}
          className={classes.prices}
        />
      </div>
    </BorderedCard>
  )
}

const useHistoryElementCardStyles = makeStyles(theme => ({
  layout: {
    marginBottom: '16px',
  },
  body: {
    display: 'flex',
    flexFlow: 'column',
    [theme.breakpoints.up('lg')]: {
      flexFlow: 'row',
    },
  },
  content: {
    flex: 6,
  },
  prices: {
    flex: 4,
  },
}))

type VerificationCardProps = {
    verification: BalanceVerification
}

const VerificationCard = (props: VerificationCardProps) => {
  const classes = useVerificationCardStyles()

  const { verification } = props
  const date = moment(verification.date)
  const createdAt = moment(verification.createdAt)
  return (
    <BorderedCard color={colors.green[500]} className={classes.layout}>
      <CardHeader title={`Verificación ${date.format('DD-MMM-YYYY')}`} />
      <div className={classes.body}>
        <CardContent className={classes.content}>
          Registrada por: {verification.createdBy?.name ?? 'Desconocido'}<br />
          Registrada el: {createdAt.format('DD-MMM-YYYY hh:mm a')}
        </CardContent>
        <CardPrices
          titleOne='Ajuste'
          valueOne={verification.adjustAmount}
          titleTwo='Balance verificado'
          valueTwo={verification.amount}
          className={classes.prices}
        />
      </div>
    </BorderedCard>
  )
}

const useVerificationCardStyles = makeStyles(theme => ({
  layout: {
    marginBottom: '16px',
  },
  body: {
    display: 'flex',
    flexFlow: 'column',
    [theme.breakpoints.up('lg')]: {
      flexFlow: 'row',
    },
  },
  content: {
    flex: 6,
  },
  prices: {
    flex: 4,
  },
}))

type BalanceItem = {
  balance: number
  date: string
  sales: number
  spendings: number
  payments: number
  verification: BalanceVerification
}
type ListBalanceResponse = {
  success: boolean
  data: BalanceItem[]
}

const useBalanceData = (params: Params) => {
  const auth = useAuth()
  const showMessage = useSnackbar()
  const [balanceData, setBalanceData] = useState<BalanceItem[]|null>(null)
  useDeepCompareEffect(() => {
    (async () => {
      const qs = paramsToString(params)
      const url = `/api/balance?${qs}`
      let response
      try {
        response = await fetchJsonAuth<ListBalanceResponse>(url, auth)
      } catch (error) {
        showMessage('Error de conexión al obtener el balance')
        return
      }

      if (isErrorResponse(response)) {
        showMessage('Error al obtener el balance: ' + response.error.message)
        return
      }

      setBalanceData(response.data.reverse())
    })()
  }, [auth, showMessage, params])

  return balanceData
}

interface BalanceItemCardProps {
  item: BalanceItem;
}

const BalanceItemCard = ({ item }: BalanceItemCardProps) => (
  <>
    <HistoryElementCard
      header={moment(item.date).format('DD-MMM-YYYY')}
      content={<>
        <div>Ventas en Efectivo: {money(item.sales)}</div>
        <div>Pagos: {money(item.payments)}</div>
        <div>Salidas: {money(item.spendings)}</div>
      </>}
      delta={item.sales + item.payments - item.spendings}
      balance={item.balance}
    />
    {item.verification && <>
      <VerificationCard
        verification={item.verification}
      />
    </>}
  </>
)

const Balance = (): JSX.Element => {
  const classes = useStyles()
  const [bDate, setBDate] = useState<Moment|null>(
    () => moment().subtract(1, 'month')
  )
  const [eDate, setEDate] = useState<Moment|null>(null)

  const balanceData = useBalanceData({
    minDate: bDate?.format('YYYY-MM-DD'),
    maxDate: eDate?.format('YYYY-MM-DD'),
    includes: ['verification.createdBy'],
  })

  return (
    <Layout title='Balance General'>
      <Title>Balance General</Title>

      <Typography variant='caption'>Filtrar por Fecha</Typography>
      <div className={classes.dateFilter}>
        <DateControl
          label='Fecha inicial'
          date={bDate}
          onDateChange={date => setBDate(date.isValid() ? date : null)}
          DatePickerProps={{
            inputVariant: 'outlined',
            clearable: true,
            clearLabel: 'Borrar',
          }}
        />
        <span className={classes.to}>→</span>
        <DateControl
          label='Fecha final'
          date={eDate}
          onDateChange={date => setEDate(date.isValid() ? date : null)}
          DatePickerProps={{
            inputVariant: 'outlined',
            clearable: true,
            clearLabel: 'Borrar',
          }}
        />
      </div>

      {balanceData?.map(item =>
        <BalanceItemCard item={item} key={item.date} />
      ) ?? <LoadingIndicator />}

    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  dateFilter: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  to: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    lineHeight: '48px',
  },
}))

export default adminOnly(Balance)
