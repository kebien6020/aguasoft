import React from 'react'
import Title from '../../../components/Title'
import type { DateRange } from '../index'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@material-ui/core'
import useMovements from '../../../hooks/api/useMovements'
import LoadingIndicator from '../../../components/LoadingIndicator'
import { formatISO } from 'date-fns'
import { InventoryElement, InventoryMovement } from '../../../models'
import { MakeRequired } from '../../../utils/types'
import groupBy from 'lodash.groupby'

interface DamageWidgetProps {
  dateRange: DateRange
}

type InventoryMovementWithInclusions =
  MakeRequired<InventoryMovement, 'inventoryElementFrom' | 'inventoryElementTo'>

export const DamageWidget = ({ dateRange }: DamageWidgetProps) => {
  const { movements, loading, error } = useMovements({
    minDate: formatISO(dateRange.minDate),
    maxDate: formatISO(dateRange.maxDate),
    include: ['inventoryElementFrom', 'inventoryElementTo'],
    cause: 'damage',
  })

  return (
    <>
      <Title>Resumen de Daño</Title>
      <TableWrapper>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>Elemento de Inventario</TableCell>
              <TableCell>Cantidad reportada dañada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><LoadingIndicator /></TableRow>}
            {error && 'Error cargando los datos de daño'}
            {!loading && !error
              && <DamageRows movements={movements as InventoryMovementWithInclusions[]} />
            }
          </TableBody>
        </StyledTable>
      </TableWrapper>
    </>
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

type Row = {
  inventoryElementFrom: InventoryElement,
  inventoryElementTo: InventoryElement
}

const rowFormatInventoryElement = (row: Row) => {
  const same = row.inventoryElementFrom.id === row.inventoryElementTo.id
  return same ? row.inventoryElementFrom.name
    : `${row.inventoryElementFrom.name} → ${row.inventoryElementTo.name}`
}

const compare = <T, >(a: T, b: T): number =>
  a < b ? -1
  : a > b ? 1
  : 0

const by = <T, U>(fn: (x: T) => U) => (a: T, b: T): number => {
  const fa = fn(a)
  const fb = fn(b)
  return compare(fa, fb)
}

interface DamageRowsProps {
  movements: InventoryMovementWithInclusions[]
}

const DamageRows = ({ movements }: DamageRowsProps) => {
  const byInventoryElement = groupBy(
    movements,
    m => `${m.inventoryElementFromId}:${m.inventoryElementToId}`
  )

  const rows = Object.entries(byInventoryElement)
    .map(([_, ms]) => ({
      inventoryElementFrom: ms[0].inventoryElementFrom,
      inventoryElementTo: ms[0].inventoryElementTo,
      quantity: ms.reduce((acc, m) => acc + Number(m.quantityFrom), 0),
    }))
    .sort(by(r => r.inventoryElementFrom.name))

  return (
    <>
      {rows.map((r, idx) => (
        <TableRow key={idx}>
          <TableCell>{rowFormatInventoryElement(r)}</TableCell>
          <TableCell>{r.quantity}</TableCell>
        </TableRow>
      ))}
    </>
  )
}
