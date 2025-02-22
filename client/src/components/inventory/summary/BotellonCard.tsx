import type { JSX } from 'react'
import { CardProps } from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import { DayMovements } from '../MovementSummary'
import Description from '../../Description'
import { InventoryMovement } from '../../../models'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'

type BotellonCardProps = CardProps & {
  dayMovements: DayMovements
}

const BotellonCard = (props: BotellonCardProps): JSX.Element => {
  const {
    dayMovements,
    ...otherProps
  } = props

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const botellonSoldTotal = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'termoencogible'
      && movement.rollback === false,
    )
    .reduce(sumQtyTo, 0)


  const botellonSoldRollbackMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'termoencogible'
      && movement.rollback === true,
    )

  const botellonSoldRollback = botellonSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const botellonSold =
    botellonSoldTotal !== undefined
    && botellonSoldRollback !== undefined
    && botellonSoldTotal - botellonSoldRollback

  const botellonSoldRollbackAmount = botellonSoldRollbackMovements?.length

  const botellonNuevoSoldTotal = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'botellon-nuevo'
      && movement.rollback === false,
    )
    .reduce(sumQtyTo, 0)


  const botellonNuevoSoldRollbackMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'botellon-nuevo'
      && movement.rollback === true,
    )

  const botellonNuevoSoldRollback = botellonNuevoSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const botellonNuevoSold =
    botellonNuevoSoldTotal !== undefined
    && botellonNuevoSoldRollback !== undefined
    && botellonNuevoSoldTotal - botellonNuevoSoldRollback

  const botellonNuevoSoldRollbackAmount = botellonNuevoSoldRollbackMovements?.length

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Botellón' />
      <CardContent>
        <Description
          title='Botellones vendidos'
          text={botellonSold}
        />
        {botellonSoldRollbackAmount !== undefined && botellonSoldRollbackAmount > 0
          && <Description
            title='Cantidad de ventas de botellón reversadas'
            text={botellonSoldRollbackAmount}
          />
        }
        <Description
          title='Botellones nuevos vendidos'
          text={botellonNuevoSold}
        />
        {botellonSoldRollbackAmount !== undefined && botellonSoldRollbackAmount > 0
          && <Description
            title='Cantidad de ventas de botellón nuevo reversadas'
            text={botellonNuevoSoldRollbackAmount}
          />
        }
      </CardContent>
    </SummaryCard>
  )
}

export default BotellonCard
