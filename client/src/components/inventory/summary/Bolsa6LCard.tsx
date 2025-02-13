import type { JSX } from 'react'
import CardContent from '@mui/material/CardContent'
import { CardProps } from '@mui/material/Card'

import Description from '../../Description'
import SummaryCard from './SummaryCard'
import SummaryCardHeader from './SummaryCardHeader'
import { DayMovements } from '../MovementSummary'
import { InventoryMovement } from '../../../models'

interface Bolsa6LCardProps extends CardProps {
  dayMovements: DayMovements
}

const Bolsa6LCard = ({ dayMovements, ...otherProps }: Bolsa6LCardProps): JSX.Element => {

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

  const bolsasProduced = dayMovements
    ?.filter(movement =>
      movement.cause === 'production'
      && movement.inventoryElementTo.code === 'bolsa-6l'
      && movement.storageFrom?.code === 'trabajo'
      && movement.storageTo?.code === 'terminado'
    )
    .reduce(sumQtyTo, 0)

  const bolsasDamaged = dayMovements
    ?.filter(movement =>
      movement.cause === 'damage'
      && movement.inventoryElementFrom.code === 'bolsa-6l'
    )
    .reduce(sumQtyTo, 0)

  const bolsasRawDamaged = dayMovements
    ?.filter(movement =>
      movement.cause === 'damage'
      && movement.inventoryElementFrom.code === 'bolsa-6l-raw'
    )
    .reduce(sumQtyTo, 0)

  const bolsasSoldTotal = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'bolsa-6l'
      && movement.rollback === false
    )
    .reduce(sumQtyTo, 0)


  const bolsasSoldRollbackMovements = dayMovements
    ?.filter(movement =>
      movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'bolsa-6l'
      && movement.rollback === true
    )

  const bolsasSoldRollback = bolsasSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const bolsasSold =
    bolsasSoldTotal !== undefined
    && bolsasSoldRollback !== undefined
    && bolsasSoldTotal - bolsasSoldRollback

  const bolsasSoldRollbackAmount = bolsasSoldRollbackMovements?.length

  const bolsasManualMovements = dayMovements
    ?.filter(movement => movement.cause === 'manual')
    ?.filter(movement =>
      movement.inventoryElementFrom?.code === 'bolsa-6l'
      || movement.inventoryElementTo?.code === 'bolsa-6l'
      || movement.inventoryElementFrom?.code === 'bolsa-6l-raw'
      || movement.inventoryElementTo?.code === 'bolsa-6l-raw'
    )
    .length

  return (
    <SummaryCard {...otherProps}>
      <SummaryCardHeader title='Bolsa 6L' />
      <CardContent>
        <Description
          title='Bolsas movidas desde bodega'
          text={bolsasFromBodega}
        />
        {bolsasProduced !== undefined && bolsasProduced > 0
          && <Description
            title='Bolsas insumo dañadas'
            text={bolsasRawDamaged}
          />
        }
        <Description
          title='Bolsas dañadas'
          text={bolsasDamaged}
        />
        <Description
          title='Bolsas producidas'
          text={bolsasProduced}
        />
        <Description
          title='Bolsas vendidas'
          text={bolsasSold}
        />
        {bolsasSoldRollbackAmount !== undefined && bolsasSoldRollbackAmount > 0
          && <Description
            title='Cantidad de ventas de bolsas reversadas'
            text={bolsasSoldRollbackAmount}
          />
        }
        {bolsasManualMovements !== undefined && bolsasManualMovements > 0
          && <Description
            title='Movimientos manuales'
            text={bolsasManualMovements}
          />
        }
      </CardContent>
    </SummaryCard>
  )
}

export default Bolsa6LCard
