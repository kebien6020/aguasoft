import type { JSX } from 'react'
import CardContent from '@mui/material/CardContent'
import { CardProps } from '@mui/material/Card'

import { DayMovements } from '../MovementSummary'
import Description from '../../Description'
import { InventoryMovement } from '../../../models'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'

export type HieloCardProps = CardProps & {
  dayMovements: DayMovements
}

const HieloCard = (props: HieloCardProps): JSX.Element => {
  const {
    dayMovements,
    ...otherProps
  } = props

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const hieloSoldTotal = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'hielo-5kg'
      && movement.rollback === false
    )
    .reduce(sumQtyTo, 0)


  const hieloSoldRollbackMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'hielo-5kg'
      && movement.rollback === true
    )

  const hieloSoldRollback = hieloSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const hieloSold =
    hieloSoldTotal !== undefined
    && hieloSoldRollback !== undefined
    && hieloSoldTotal - hieloSoldRollback

  const hieloSoldRollbackAmount = hieloSoldRollbackMovements?.length

  const hielosProduced = dayMovements
    ?.filter(movement =>
      movement.cause === 'production'
      && movement.inventoryElementTo.code === 'hielo-5kg'
      && movement.storageTo?.code === 'terminado'
    )
    .reduce(sumQtyTo, 0)

  const hielosManualMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'manual'
      && (
        movement.inventoryElementFrom.code === 'hielo-5kg'
        || movement.inventoryElementTo.code === 'hielo-5kg'
      )
    ).length

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Hielo 5Kg' />
      <CardContent>
        <Description
          title='Hielos producidos'
          text={hielosProduced}
        />
        <Description
          title='Hielos vendidos'
          text={hieloSold}
        />
        {hieloSoldRollbackAmount !== undefined && hieloSoldRollbackAmount > 0
          && <Description
            title='Ventas de hielo reversadas'
            text={hieloSoldRollbackAmount}
          />
        }
        {hielosManualMovements !== undefined && hielosManualMovements > 0
          && <Description
            title='Movimientos manuales relacionados a hielos'
            text={hielosManualMovements}
          />
        }
      </CardContent>
    </SummaryCard>
  )
}

export default HieloCard
