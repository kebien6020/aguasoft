import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import * as colors from '@material-ui/core/colors'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Moment } from 'moment'

import BorderedCard from '../components/BorderedCard'
import CardHeader from '../components/CardHeader'
import DateControl from '../components/controls/DateControl'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { money, moneySign } from '../utils'

type CardPricesProps = {
  titleOne: React.ReactNode
  titleTwo: React.ReactNode
  valueOne: number
  valueTwo: number
}

const CardPrices = (props: CardPricesProps) => {
  const {
    titleOne,
    titleTwo,
    valueOne,
    valueTwo,
  } = props
  const classes = useCardPricesStyles()

  return (
    <div className={classes.cardPrices}>
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
    <BorderedCard>
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
        />
      </div>
    </BorderedCard>
  )
}

const useHistoryElementCardStyles = makeStyles(theme => ({
  body: {
    display: 'flex',
    flexFlow: 'column',
    [theme.breakpoints.up('lg')]: {
      flexFlow: 'row',
    },
  },
  content: {
    flex: 1,
  },
}))

const Balance = () => {
  const classes = useStyles()
  const [bDate, setBDate] = useState<Moment|null>(null)
  const [eDate, setEDate] = useState<Moment|null>(null)

  return (
    <Layout title='Balance General'>
      <Title>Balance General</Title>

      <Typography variant='caption'>Filtrar por Fecha</Typography>
      <div className={classes.dateFilter}>
        <DateControl
          label='Fecha inicial'
          date={bDate}
          onDateChange={setBDate}
          DatePickerProps={{
            inputVariant: 'outlined',
          }}
        />
        <span className={classes.to}>→</span>
        <DateControl
          label='Fecha final'
          date={eDate}
          onDateChange={setEDate}
          DatePickerProps={{
            inputVariant: 'outlined',
          }}
        />
      </div>

      <HistoryElementCard
        header='12-Mar-2020'
        content={<>
          Ventas: $ +123.050<br />
          Pagos: $ +32.100<br />
          Salidas: $ -13.500
        </>}
        delta={250000}
        balance={5000000}
      />
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
  }
}))

export default Balance
