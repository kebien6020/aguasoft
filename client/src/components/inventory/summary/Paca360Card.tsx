import type { JSX } from 'react'
import { CardProps } from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Description from '../../Description'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'
import { InventoryMovement } from '../../../models'
import { DayMovements } from '../MovementSummary'


export interface Paca360CardProps extends CardProps {
  dayMovements: DayMovements
}

const Paca360Card = (props: Paca360CardProps): JSX.Element => {
  const { className, dayMovements, ...otherProps } = props

  const sumQtyFrom = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityFrom)

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const rollosFromBodega = dayMovements
    ?.filter(movement =>
      movement.cause === 'relocation'
      && movement.inventoryElementFrom.code === 'rollo-360'
      && movement.storageFrom?.code === 'bodega'
      && movement.storageTo?.code === 'trabajo',
    )
    .reduce(sumQtyTo, 0)

  const rollosRemoved = dayMovements
    ?.filter(movement =>
      movement.cause === 'relocation'
      && movement.inventoryElementFrom.code === 'rollo-360'
      && movement.storageFrom?.code === 'trabajo'
      && movement.storageTo === null,
    )
    .reduce(sumQtyTo, 0)

  const bolsasProduced = dayMovements
    ?.filter(movement =>
      movement.cause === 'production'
      && movement.inventoryElementTo.code === 'bolsa-360'
      && movement.storageFrom === null
      && movement.storageTo?.code === 'intermedia',
    )
    .reduce(sumQtyTo, 0)

  const bolsasDamaged = dayMovements
    ?.filter(movement =>
      movement.cause === 'damage'
      && movement.inventoryElementFrom.code === 'bolsa-360',
    )
    .reduce(sumQtyTo, 0)

  const pacasUnpack = dayMovements
    ?.filter(movement =>
      movement.inventoryElementFrom.code === 'paca-360'
      && movement.inventoryElementTo.code === 'bolsa-360',
    )
    .reduce(sumQtyFrom, 0)

  const pacasProduced = dayMovements
    ?.filter(movement =>
      movement.cause === 'production'
      && movement.inventoryElementTo.code === 'paca-360'
      && movement.storageTo?.code === 'terminado',
    )
    .reduce(sumQtyTo, 0)

  const pacasSoldTotal = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === false,
    )
    .reduce(sumQtyTo, 0)


  const pacasSoldRollbackMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === true,
    )

  const pacasSoldRollback = pacasSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const pacasSold =
    pacasSoldTotal !== undefined
    && pacasSoldRollback !== undefined
    && pacasSoldTotal - pacasSoldRollback

  const pacasSoldRollbackAmount = pacasSoldRollbackMovements?.length

  const manualMovements = dayMovements
    ?.filter(movement => movement.cause === 'manual')

  const rollosManualMovements = manualMovements
    ?.filter(movement =>
      movement.inventoryElementFrom?.code === 'rollo-360'
      || movement.inventoryElementTo?.code === 'rollo-360',
    )
    .length

  const bolsasManualMovements = manualMovements
    ?.filter(movement =>
      movement.inventoryElementFrom?.code === 'bolsa-360'
      || movement.inventoryElementTo?.code === 'bolsa-360',
    )
    .length

  const pacasManualMovements = manualMovements
    ?.filter(movement =>
      movement.inventoryElementFrom?.code === 'paca-360'
      || movement.inventoryElementTo?.code === 'paca-360',
    )
    .length

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Bolsa / Paca 360' />
      <CardContent>
        <Description
          title='Rollos movidos desde bodega'
          text={rollosFromBodega}
        />
        {rollosFromBodega !== rollosRemoved
          && <Description
            title='Rollos vacios removidos'
            text={rollosRemoved}
          />
        }
        <Description
          title='Bolsas 360 Individuales producidas'
          text={bolsasProduced}
        />
        <Description
          title='Bolsas 360 Individuales dañadas'
          text={bolsasDamaged}
        />
        <Description
          title='Pacas producidas'
          text={pacasProduced}
        />
        {pacasUnpack !== undefined && pacasUnpack > 0
          && <Description
            title='Pacas desempacadas'
            text={pacasUnpack}
          />
        }
        <Description
          title='Pacas vendidas'
          text={pacasSold}
        />
        {pacasSoldRollbackAmount !== undefined && pacasSoldRollbackAmount > 0
          && <Description
            title='Cantidad de ventas de pacas reversadas'
            text={pacasSoldRollbackAmount}
          />
        }
        {rollosManualMovements !== undefined && rollosManualMovements > 0
          && <Description
            title='Movimientos manuales relacionados a rollos'
            text={rollosManualMovements}
          />
        }
        {bolsasManualMovements !== undefined && bolsasManualMovements > 0
          && <Description
            title='Movimientos manuales relacionados a bolsas'
            text={bolsasManualMovements}
          />
        }
        {pacasManualMovements !== undefined && pacasManualMovements > 0
          && <Description
            title='Movimientos manuales relacionados a pacas'
            text={pacasManualMovements}
          />
        }
      </CardContent>
    </SummaryCard>
  )
}

export default Paca360Card
