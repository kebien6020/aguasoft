import * as React from 'react'
import CardContent from '@material-ui/core/CardContent'
import { CardProps } from '@material-ui/core/Card'

import Description from '../../Description'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'
import { DayMovements } from '../MovementSummary'
import { InventoryMovement } from '../../../models'

interface Bolsa6LCardProps extends CardProps {
  dayMovements: DayMovements
}

const Bolsa6LCard = ({dayMovements, ...otherProps}: Bolsa6LCardProps) => {

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const bolsasFromBodega = dayMovements
    ?.filter(movement =>
         movement.cause === 'relocation'
      && movement.inventoryElementFrom.code === 'bolsa-6l-raw'
      && movement.storageFrom?.code === 'bodega'
      && movement.storageTo?.code === 'trabajo'
    )
    .reduce(sumQtyTo, 0)

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Bolsa 6L' />
      <CardContent>
        <Description
          title='Bolsas movidas desde bodega'
          text={bolsasFromBodega}
        />
      </CardContent>
    </SummaryCard>
  )
}

export default Bolsa6LCard
