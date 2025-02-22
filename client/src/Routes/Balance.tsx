import type { JSX } from 'react'
import { Button, ButtonProps, Collapse, Tooltip } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import * as colors from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import { useState, ReactNode } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import BorderedCard from '../components/BorderedCard'
import CardHeader from '../components/CardHeader'
import { ClearableDatePicker as DateControl } from '../components/MyDatePicker'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import Title from '../components/Title'
import useAuth from '../hooks/useAuth'
import { useNonce } from '../hooks/useNonce'
import useSnackbar from '../hooks/useSnackbar'
import { useToggle } from '../hooks/useToggle'
import useUser from '../hooks/useUser'
import { BalanceItem, BalanceVerification } from '../models'
import {
  ErrorResponse,
  fetchJsonAuth,
  formatDateCol,
  formatDatetimeCol,
  isErrorResponse,
  money,
  moneySign,
  Params,
  paramsToString,
  parseDateonlyMachine,
} from '../utils'
import { CreateVerificationForm } from './balance/components/CreateVerificationForm'
import { addMonths, isValid } from 'date-fns'
import { Theme } from '../theme'
import { formatDateonlyMachine } from '../utils/dates'

type CardPricesProps = {
  titleOne: ReactNode
  titleTwo: ReactNode
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
  content: ReactNode
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

const useHistoryElementCardStyles = makeStyles((theme: Theme) => ({
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
  const date = new Date(verification.date)
  const createdAt = new Date(verification.createdAt)
  return (
    <BorderedCard color={colors.green[500]} className={classes.layout}>
      <CardHeader title={`Verificación ${formatDateCol(date)}`} />
      <div className={classes.body}>
        <CardContent className={classes.content}>
          Registrada por: {verification.createdBy?.name ?? 'Desconocido'}<br />
          Registrada el: {formatDatetimeCol(createdAt)}
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

const useVerificationCardStyles = makeStyles((theme: Theme) => ({
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

type ListBalanceResponse = {
  success: boolean
  data: BalanceItem[]
}

const useBalanceData = (params: Params) => {
  const auth = useAuth()
  const showMessage = useSnackbar()
  const [balanceData, setBalanceData] = useState<BalanceItem[] | null>(null)
  const [nonce, refresh] = useNonce()
  useDeepCompareEffect(() => {
    (async () => {
      const qs = paramsToString(params)
      const url = `/api/balance?${qs}`
      let response: ListBalanceResponse | ErrorResponse
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
  }, [auth, showMessage, params, nonce])

  return [balanceData, { refresh }] as const
}

interface BalanceItemCardProps {
  item: BalanceItem;
}

const BalanceItemCard = ({ item }: BalanceItemCardProps) => (
  <>
    <HistoryElementCard
      header={formatDateCol(parseDateonlyMachine(item.date))}
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
  const [bDate, setBDate] = useState<Date | null>(
    () => addMonths(new Date, -1),
  )
  const [eDate, setEDate] = useState<Date | null>(null)

  const [balanceData, { refresh }] = useBalanceData({
    minDate: bDate === null ? undefined : formatDateonlyMachine(bDate),
    maxDate: eDate === null ? undefined : formatDateonlyMachine(eDate),
    includes: ['verification.createdBy'],
  })

  const [showForm, { toggle }] = useToggle()

  return (
    <Layout title='Balance General'>
      <Title>Balance General</Title>
      <AddVerificationButton onClick={toggle} />
      <Collapse in={showForm}>
        <CreateVerificationForm onCreated={refresh} />
      </Collapse>

      <Typography variant='caption'>Filtrar por Fecha</Typography>
      <DateFilter>
        <DateControl
          label='Fecha inicial'
          date={bDate}
          onDateChange={date => {
            setBDate(isValid(date) ? date : null) 
          }}
        />
        <ArrowRight />
        <DateControl
          label='Fecha final'
          date={eDate}
          onDateChange={date => {
            setEDate(isValid(date) ? date : null) 
          }}
        />
      </DateFilter>

      {balanceData?.map(item =>
        <BalanceItemCard item={item} key={item.date} />,
      ) ?? <LoadingIndicator />}

    </Layout>
  )
}
export default Balance

const DateFilter = styled('div')({
  display: 'flex',
  flexFlow: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}) as unknown as 'div'

const ArrowRight = styled(props => <span {...props}>→</span>)(({ theme }: { theme: Theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  lineHeight: '48px',
})) as unknown as 'span'

const AddVerificationButton = (props: ButtonProps) => {
  const isAdmin = useUser()?.isAdmin ?? false
  const explanation = isAdmin
    ? '' // Empty string tooltips are not displayed
    : 'Solo usuario administrador puede crear una verificación'

  return (
    <ButtonWrapper>
      <Tooltip title={explanation}>
        {/*
          This div is required because when the button is disabled it has no
          pointer events and the tooltip doesn't show up
         */}
        <div>
          <Button
            variant='outlined'
            color='primary'
            disabled={!isAdmin}
            {...props}
          >
            Crear Verificación
          </Button>
        </div>
      </Tooltip>
    </ButtonWrapper>
  )
}

const ButtonWrapper = styled('div')({
  display: 'flex',
  flexFlow: 'row',
  justifyContent: 'center',
}) as unknown as 'div'
