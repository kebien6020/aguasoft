import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import * as moment from 'moment'

import useMovements from '../../hooks/api/useMovements'
import MyDatePicker from '../MyDatePicker'
import Title from '../Title'
import Bolsa6LCard from './summary/Bolsa6LCard'
import Paca360Card from './summary/Paca360Card'
import BotellonCard from './summary/BotellonCard'
import { InventoryMovement } from '../../models'
import { MakeRequired } from '../../utils'

// Storages can be null
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

  const dayMovements = movements as DayMovements

  return (
    <div className={classes.section}>
      <Title>Resumen por Productos</Title>
      {datePicker}

      <Paca360Card dayMovements={dayMovements} />
      <Bolsa6LCard dayMovements={dayMovements} />
      <BotellonCard dayMovements={dayMovements} />
    </div>
  )
}

const useStyles = makeStyles({
  section: {
    marginBottom: '2rem',
  },
})

export default MovementSummary
