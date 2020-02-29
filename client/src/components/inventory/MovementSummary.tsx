import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import * as moment from 'moment'

import useMovements from '../../hooks/api/useMovements'
import MyDatePicker from '../MyDatePicker'
import Title from '../Title'
import { InventoryMovement } from '../../models'
import { MakeRequired } from '../../utils'
import Paca360Card from './summary/Paca360Card'

type RequiredInclusions = 'inventoryElementFrom' | 'inventoryElementTo'
export type DayMovements = MakeRequired<InventoryMovement, RequiredInclusions>[] | null

const MovementSummary = () => {
  const classes = useStyles()

  // Date picker
  const [date, setDate] = useState(() => moment().startOf('day'))
  const datePicker =
    <MyDatePicker
      date={date}
      onDateChange={setDate}
      DatePickerProps={{
        inputVariant: 'outlined',
        label: 'Fecha',
      }}
    />

  // Load day movements
  const params = {
    include: ['storageFrom', 'storageTo', 'inventoryElementFrom', 'inventoryElementTo'],
    minDate: date.startOf('day').toISOString(),
    maxDate: date.endOf('day').toISOString(),
  } as const

  const { movements } = useMovements(params)

  // Storages can be null
  const dayMovements = movements as DayMovements

  return (
    <div className={classes.section}>
      <Title>Resumen por Productos</Title>
      {datePicker}

      <Paca360Card dayMovements={dayMovements} />
    </div>
  )
}

const useStyles = makeStyles({
  section: {
    marginBottom: '2rem',
  },
})

export default MovementSummary
