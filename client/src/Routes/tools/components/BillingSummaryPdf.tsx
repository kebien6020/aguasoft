import React from 'react'
import type { SaleWithProduct } from '../BillingSummary'
import ReactPDF, {
  Document,
  Font,
  Page as RPPage,
  Text as RPText, View,
} from '@react-pdf/renderer'
import { styled } from './styles'
import { format, formatISO, parseISO, startOfDay, endOfDay, isSameDay } from 'date-fns'
import es from 'date-fns/locale/es'
import RobotoBold from '../../../fonts/roboto/Roboto-Bold.ttf'
import RobotoMedium from '../../../fonts/roboto/Roboto-Medium.ttf'
import RobotoRegular from '../../../fonts/roboto/Roboto-Regular.ttf'
import { isSameDayOrAfter, isSameDayOrBefore } from '../../../utils/dates'
import { money } from '../../../utils'
import theme from '../../../theme'

export interface BillingSummaryPdfProps {
  sales: SaleWithProduct[] // Must be ordered by date and not include deleted sales
  title: string
}

const formatLong = (date: Date) => format(date, 'PPP', { locale: es })
const formatShort = (date: Date) => format(date, 'P', { locale: es })

// Disable breaking words with hyphens
Font.registerHyphenationCallback(word => [word])

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular },
    { src: RobotoMedium, fontWeight: 500 },
    { src: RobotoBold, fontWeight: 700 },
  ],
})

export const BillingSummaryPdf = React.memo(
  function BillingSummaryPdf(props: BillingSummaryPdfProps): JSX.Element {
    const { title, sales } = props

    const salesDates = sales.map(s => ({ ...s, date: parseISO(s.date) }))

    const minDate = salesDates[0]?.date
    const maxDate = salesDates[sales.length - 1]?.date
    const subtitle = minDate && maxDate && `Desde el ${formatLong(minDate)} hasta el ${formatLong(maxDate)}`

    const products = sales
      .map(s => s.Product)
      .filter((prod, idx, self) => self.findIndex(p => prod.id === p.id) === idx)

    const days = salesDates
      .map(s => s.date)
      .filter((date, idx, self) => self.findIndex(d => isSameDay(d, date)) === idx)
    const calculateDayAmount = (day: Date, productId: number) => {
      const min = startOfDay(day)
      const max = endOfDay(day)
      return salesDates
        .filter(s => isSameDayOrAfter(s.date, min) && isSameDayOrBefore(s.date, max))
        .filter(s => s.productId === productId)
        .reduce((acc, s) => acc + s.quantity, 0)
    }

    const showAmount = (amount: number) => amount === 0 ? '' : String(amount)

    const calculateTotalDay = (day: Date) => {
      const min = startOfDay(day)
      const max = endOfDay(day)
      return salesDates
        .filter(s => isSameDayOrAfter(s.date, min) && isSameDayOrBefore(s.date, max))
        .reduce((acc, s) => acc + s.value, 0)
    }

    const calculateTotalProduct = (productId: number) => {
      return salesDates
        .filter(s => s.productId === productId)
        .reduce((acc, s) => acc + s.quantity, 0)
    }

    const total = salesDates.reduce((acc, s) => acc + s.value, 0)

    console.log('render', Date.now(), props)

    return (
      <Document title={title}>
        <Page size='LETTER'>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
          <Table style={{ marginTop: 16 }}>
            <HeaderRow>
              <HeaderCell>Fecha</HeaderCell>
              {products.map(product => <HeaderCell key={product.id}>{product.name}</HeaderCell>
              )}
              <HeaderCell>Total Día</HeaderCell>
            </HeaderRow>

            {days.map((day, idx) => <BodyRow key={formatISO(day)} idx={idx}>
              <BodyCellLeft>{formatShort(day)}</BodyCellLeft>
              {products.map(product => <BodyCell key={product.id}>
                {showAmount(calculateDayAmount(day, product.id))}
              </BodyCell>
              )}
              <BodyCell>{money(calculateTotalDay(day))}</BodyCell>
            </BodyRow>
            )}

            <FooterRow>
              <FooterCell>Total</FooterCell>
              {products.map(product => <FooterCell key={product.id}>
                {showAmount(calculateTotalProduct(product.id))}
              </FooterCell>
              )}
              <FooterCell>{money(total)}</FooterCell>
            </FooterRow>
          </Table>

        </Page>
      </Document>
    )
  }
)

const Text = styled(RPText)({
  fontFamily: 'Roboto',
})

const Title = styled(Text)({
  textAlign: 'center',
  fontSize: 18,
  paddingBottom: 8,
  fontWeight: 'bold',
})

const Subtitle = styled(Text)({
  textAlign: 'center',
  opacity: 0.6,
  fontSize: 12,
})

const Page = styled(RPPage)({
  paddingTop: '2cm',
  paddingBottom: '2cm',
  paddingLeft: '15mm',
  paddingRight: '15mm',
})

const Table = styled(View)({
  display: 'table',
  width: '100%',
  marginLeft: 0,
  marginRight: 0,
})

const Row = styled(View)({
  flexDirection: 'row',
  width: '100%',
  borderWidth: 1,
  borderColor: theme.palette.primary.light,
})

const HeaderRow = styled(Row)({
  backgroundColor: theme.palette.primary.main,
})

const Cell = styled(View)({
  flex: 1,
  justifyContent: 'center',
  paddingLeft: 2,
  paddingRight: 2,
  paddingTop: 1,
  paddingBottom: 1,
})

const HeaderText = styled(Text)({
  color: theme.palette.getContrastText(theme.palette.primary.main),
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
})

const HeaderCell = ({ children }: {children: string}) =>
  <Cell>
    <HeaderText>{children}</HeaderText>
  </Cell>

interface BodyRowProps extends ReactPDF.ViewProps {
  idx: number
}
const BodyRow = styled<BodyRowProps>(
  ({ idx, ...props }) => <Row {...props} />
)(({ idx }) => [
  {
    borderTopWidth: 0,
  },
  { ...(idx % 2 === 0 ? { backgroundColor: theme.palette.primary.light } : undefined) },
])

const BodyText = styled(Text)({
  fontSize: 12,
  textAlign: 'center',
})

const BodyCell = ({ children }: {children: string}) =>
  <Cell>
    <BodyText>{children}</BodyText>
  </Cell>

const BodyCellLeft = ({ children }: {children: string}) =>
  <Cell>
    <BodyText style={{ textAlign: 'left' }}>{children}</BodyText>
  </Cell>


const FooterRow = styled(Row)({
  borderTopStyle: 'solid',
  borderTopColor: theme.palette.primary.dark,
  borderTopWidth: 2,
})

const FooterText = styled(Text)({
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
})

const FooterCell = ({ children }: {children: string}) =>
  <Cell>
    <FooterText>{children}</FooterText>
  </Cell>
