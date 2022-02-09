import { Grid, GridProps, Paper, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography, TypographyProps } from '@material-ui/core'
import * as React from 'react'
import LoadingIndicator from '../../../components/LoadingIndicator'
import Title from '../../../components/Title'
import { useSales } from '../../../hooks/api/useSales'
import { Sell } from '../../../models'
import { money } from '../../../utils'
import type { DateRange } from '../index'
import groupBy from 'lodash.groupby'
import { MakeRequired } from '../../../utils/types'

type SellWithProduct = MakeRequired<Sell, 'Product'>
type SellWithUser = MakeRequired<Sell, 'User'>
type SellWithInclusions = SellWithProduct & SellWithUser

interface SalesWidgetProps {
  dateRange: DateRange
  rangeDescr: string
}

const sumValues = (acc: number, sale: Sell) => acc + sale.value

export const SalesWidget = ({ rangeDescr, dateRange }: SalesWidgetProps): JSX.Element => {
  const { minDate, maxDate } = dateRange

  const [sales] = useSales<SellWithInclusions>({
    minDate: minDate.toISOString(),
    maxDate: maxDate.toISOString(),
    'include[0][association]': 'Product',
    'include[0][attributes][]': 'name',
    'include[1][association]': 'User',
    'include[1][paranoid]': 'false',
    'include[1][attributes][]': 'name',
  })

  return (
    <section>
      <Title>Ventas del {rangeDescr}</Title>

      {sales ? <>
        <Totals sales={sales} />
        <Products sales={sales} />
        <ByUser sales={sales} />
      </> : <>
        <LoadingIndicator />
      </>}

    </section>
  )
}

interface TotalsProps {
  sales: Sell[]
}

const Totals = ({ sales }: TotalsProps) => {
  const cash = sales
    .filter(sale => sale.cash)
    .reduce(sumValues, 0)

  const post = sales
    .filter(sale => !sale.cash)
    .reduce(sumValues, 0)

  return (
    <Grid container spacing={3}>
      <TotalsItem xs={12} sm={6}>
        Venta efectivo: {money(cash)}
      </TotalsItem>
      <TotalsItem xs={12} sm={6}>
        Venta pago post-fechado: {money(post)}
      </TotalsItem>
      <TotalsItem xs={12}>
        Venta total: {money(cash + post)}
      </TotalsItem>
    </Grid>
  )
}

const TotalsItem = ({ children, ...props }: GridProps) => (
  <Grid item {...props}>
    <TotalsPaper>
      <TotalsText>
        {children}
      </TotalsText>
    </TotalsPaper>
  </Grid>
)

const TotalsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}))

const TotalsText = (props: TypographyProps) =>
  <Typography variant='body2' {...props} />

interface ProductsProps {
  sales: SellWithProduct[]
}

const Products = ({ sales }: ProductsProps) => {
  const aggregate = Object.entries(groupBy(sales, 'productId'))
    .map(([pId, prodSales]) => ({
      productId: pId,
      saleCount: prodSales.reduce((acc, sale) => acc + sale.quantity, 0),
      saleValue: prodSales.reduce((acc, sale) => acc + sale.value, 0),
      product: prodSales[0].Product,
    }))

  const total = aggregate.reduce((acc, r) => acc + r.saleValue, 0)
  const pct = (value: number) => `(${Math.round(value / total * 100)}%)`

  return (
    <TableWrapper>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad Vendida</TableCell>
            <TableCell>Venta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregate.map(row =>
            <TableRow key={row.productId}>
              <TableCell>{row.product.name}</TableCell>
              <TableCell>{row.saleCount}</TableCell>
              <TableCell>{money(row.saleValue)} {pct(row.saleValue)}</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>-</TableCell>
            <TableCell>
              {money(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </StyledTable>
    </TableWrapper>
  )
}

const TableWrapper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
}))

const StyledTable = styled(Table)({
  '& *': {
    textAlign: 'center',
  },
})


interface ByUserProps {
  sales: SellWithUser[]
}

const ByUser = ({ sales }: ByUserProps) => {
  const sumValue = (acc: number, sale: Sell) => acc + sale.value
  const aggregate = Object.entries(groupBy(sales, 'userId'))
    .map(([uId, userSales]) => ({
      userId: uId,
      saleCash: userSales.filter(s => s.cash).reduce(sumValue, 0),
      salePost: userSales.filter(s => !s.cash).reduce(sumValue, 0),
      user: userSales[0].User,
    }))

  const totalCash = aggregate.reduce((acc, u) => acc + u.saleCash, 0)
  const totalPost = aggregate.reduce((acc, u) => acc + u.salePost, 0)

  return (
    <TableWrapper>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell>Venta Efectivo</TableCell>
            <TableCell>Venta Post-fechado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregate.map(row =>
            <TableRow key={row.userId}>
              <TableCell>{row.user.name}</TableCell>
              <TableCell>{money(row.saleCash)}</TableCell>
              <TableCell>{money(row.salePost)}</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>{money(totalCash)}</TableCell>
            <TableCell>{money(totalPost)}</TableCell>
          </TableRow>
        </TableBody>
      </StyledTable>
    </TableWrapper>
  )
}
