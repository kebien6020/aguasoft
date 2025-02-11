import * as React from 'react'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

import { money } from '../../../../utils'
import { SaleLineState } from '../types/util'

export interface TotalsRowProps {
  lineStates: SaleLineState[]
}

export const TotalsRow = ({ lineStates } : TotalsRowProps): JSX.Element => {
  const total = lineStates.reduce((acc, l) => {
    const qty = l.productQty
    const price = l.selectedPrice.value
    return acc + qty * price
  }, 0)

  return (
    <TableRow>
      <TableCell colSpan={3}></TableCell>
      <TableCell>Total</TableCell>
      <TableCell>
        {money(total)}
      </TableCell>
    </TableRow>
  )
}
