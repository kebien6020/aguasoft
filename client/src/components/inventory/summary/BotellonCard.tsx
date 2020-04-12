import * as React from 'react'
import { CardProps } from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { DayMovements } from '../MovementSummary'
import Description from '../../Description'
import { InventoryMovement } from '../../../models'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'

type BotellonCardProps = CardProps & {
    dayMovements: DayMovements
}

const BotellonCard = (props: BotellonCardProps) => {
  const {
      dayMovements,
      ...otherProps
  } = props

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const botellonSoldTotal = dayMovements
    ?.filter(movement =>
         movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === false
    )
    .reduce(sumQtyTo, 0)


  const botellonSoldRollbackMovements = dayMovements
    ?.filter(movement =>
         movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === true
    )

  const botellonSoldRollback = botellonSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const botellonSold =
    botellonSoldTotal !== undefined &&
    botellonSoldRollback !== undefined &&
    botellonSoldTotal - botellonSoldRollback

  const botellonSoldRollbackAmount = botellonSoldRollbackMovements?.length

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Botellón' />
      <CardContent>
        <Description
          title='Botellones vendidos'
          text={botellonSold}
        />
        {botellonSoldRollbackAmount !== undefined && botellonSoldRollbackAmount > 0 &&
          <Description
            title='Cantidad de ventas de botellón reversadas'
            text={botellonSoldRollbackAmount}
          />
        }
      </CardContent>
    </SummaryCard>
  )
}

export default BotellonCard
