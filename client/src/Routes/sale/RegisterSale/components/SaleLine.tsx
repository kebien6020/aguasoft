import * as React from 'react'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography, { TypographyProps } from '@mui/material/Typography'

import { SaleProduct, ProductVariant, SimplePrice } from '../types/models'
import { NumericPicker } from './NumericPicker'
import { money } from '../../../../utils'
import { DEFAULT_PRICE_ID } from '../enum'
import { InputEvent } from '../types/util'

export interface SaleLineProps {
  product: SaleProduct
  variant: ProductVariant | undefined
  productQty: number
  selectedPrice: SimplePrice | undefined
  productPrices: SimplePrice[] | undefined
  onProductQtyChange: (id: number, variantId: number | undefined, qty: number) => unknown
  onPriceChange: (id: number, variantId: number | undefined, price: SimplePrice) => unknown
}

export const SaleLine = (props: SaleLineProps): JSX.Element => {
  const {
    product,
    variant,
    productQty,
    productPrices,
    selectedPrice,
    onProductQtyChange,
    onPriceChange,
  } = props

  const handlePriceChange = (event: InputEvent) => {
    const priceId = Number(event.target.value)
    const price = productPrices?.find(p => p.id === priceId)
    if (!price) {
      console.warn(
        `Price id ${priceId} not found in list of prices`,
        productPrices
      )
      return
    }
    onPriceChange(
      product.id,
      variant?.id,
      price,
    )
  }

  return (
    <TableRow>
      <TableCell>{product.code}</TableCell>
      <TableCell>
        <div>{product.name}</div>
        {variant && <VariantName>{variant.name}</VariantName>}
      </TableCell>
      <QtyCell>
        <NumericPicker
          value={productQty}
          onChange={qty => onProductQtyChange(product.id, variant?.id, qty)}
        />
      </QtyCell>
      <TableCell align='right'>
        <Select
          id={`price-product-${product.id}`}
          fullWidth
          value={selectedPrice?.id ?? DEFAULT_PRICE_ID}
          onChange={handlePriceChange}
        >
          {productPrices?.map((price, key) =>
            <MenuItem key={key} value={price.id}>
              {price.name} | {money(price.value, 2)}
            </MenuItem>
          ) ?? <MenuItem value='none'>Cargando…</MenuItem>}
        </Select>
      </TableCell>
      <TableCell align='right'>
        {selectedPrice !== undefined
          ? money(selectedPrice.value * productQty)
          : 'Cargando…'
        }
      </TableCell>
    </TableRow>
  )
}

const VariantName = (props: TypographyProps) =>
  <Typography variant='caption' color='textSecondary' {...props} />

const QtyCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.down('lg')]: {
    '& button': {
      minWidth: '24px',
    },
    '& span': {
      width: undefined,
    },
  },
}))
