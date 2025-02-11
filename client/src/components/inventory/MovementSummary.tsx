import { useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'

import useMovements from '../../hooks/api/useMovements'
import MyDatePicker from '../MyDatePicker'
import Title from '../Title'
import Bolsa6LCard from './summary/Bolsa6LCard'
import Paca360Card from './summary/Paca360Card'
import BotellonCard from './summary/BotellonCard'
import HieloCard from './summary/HieloCard'
import { InventoryMovement } from '../../models'
import { MakeRequired } from '../../utils/types'
import { endOfDay, startOfDay } from 'date-fns'

// Storages can be null
type RequiredInclusions = 'inventoryElementFrom' | 'inventoryElementTo'
export type DayMovements = MakeRequired<InventoryMovement, RequiredInclusions>[] | null

const MovementSummary = (): JSX.Element => {
  const classes = useStyles()

  // Date picker
  const [date, setDate] = useState(() => startOfDay(new Date))
  const datePicker =
    <MyDatePicker
      date={date}
      onDateChange={setDate}
      DatePickerProps={{
        // TODO: Figure out new prop
        // inputVariant: 'outlined',
        label: 'Fecha',
      }}
    />

  // Load day movements
  const params = {
    include: ['storageFrom', 'storageTo', 'inventoryElementFrom', 'inventoryElementTo'],
    minDate: startOfDay(date).toISOString(),
    maxDate: endOfDay(date).toISOString(),
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
      <HieloCard dayMovements={dayMovements} />
    </div>
  )
}

const useStyles = makeStyles({
  section: {
    marginBottom: '2rem',
  },
})

export default MovementSummary
