import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card, { CardProps } from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import clsx from 'clsx'

import Description from '../../Description'
import { InventoryMovement } from '../../../models'
import { DayMovements } from '../MovementSummary'


export interface Paca360CardProps extends CardProps {
  dayMovements: DayMovements
}

const Paca360Card = (props: Paca360CardProps) => {
  const { className, dayMovements, ...otherProps } = props
  const classes = usePaca360Styles()

  const sumQtyFrom = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityFrom)

  const sumQtyTo = (acc: number, movement: InventoryMovement) =>
    acc + Number(movement.quantityTo)

  const rollosFromBodega = dayMovements
    ?.filter(movement =>
         movement.cause === 'relocation'
      && movement.inventoryElementFrom.code === 'rollo-360'
      && movement.storageFrom?.code === 'bodega'
      && movement.storageTo?.code === 'trabajo'
    )
    .reduce(sumQtyTo, 0)

  const rollosRemoved = dayMovements
    ?.filter(movement =>
         movement.cause === 'relocation'
      && movement.inventoryElementFrom.code === 'rollo-360'
      && movement.storageFrom?.code === 'trabajo'
      && movement.storageTo === null
    )
    .reduce(sumQtyTo, 0)

  const bolsasProduced = dayMovements
    ?.filter(movement =>
         movement.cause === 'production'
      && movement.inventoryElementTo.code === 'bolsa-360'
      && movement.storageFrom === null
      && movement.storageTo?.code === 'intermedia'
    )
    .reduce(sumQtyTo, 0)

  const bolsasDamaged = dayMovements
    ?.filter(movement =>
         movement.cause === 'damage'
      && movement.inventoryElementFrom.code === 'bolsa-360'
    )
    .reduce(sumQtyTo, 0)

  const pacasUnpack = dayMovements
    ?.filter(movement =>
         movement.inventoryElementFrom.code === 'paca-360'
      && movement.inventoryElementTo.code === 'bolsa-360'
    )
    .reduce(sumQtyFrom, 0)

  const pacasProduced = dayMovements
    ?.filter(movement =>
         movement.cause === 'production'
      && movement.inventoryElementTo.code === 'paca-360'
      && movement.storageTo?.code === 'terminado'
    )
    .reduce(sumQtyTo, 0)

  const pacasSoldTotal = dayMovements
    ?.filter(movement =>
         movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === false
    )
    .reduce(sumQtyTo, 0)


  const pacasSoldRollbackMovements = dayMovements
    ?.filter(movement =>
         movement.cause === 'sell'
      && movement.inventoryElementFrom.code === 'paca-360'
      && movement.rollback === true
    )

  const pacasSoldRollback = pacasSoldRollbackMovements
    ?.reduce(sumQtyTo, 0)

  const pacasSold =
    pacasSoldTotal &&
    pacasSoldRollback &&
    pacasSoldTotal - pacasSoldRollback

  const pacasSoldRollbackAmount = pacasSoldRollbackMovements?.length

  const manualMovements = dayMovements
    ?.filter(movement => movement.cause === 'manual')

  const rollosManualMovements = manualMovements
    ?.filter(movement =>
         movement.inventoryElementFrom?.code === 'rollo-360'
      || movement.inventoryElementTo?.code === 'rollo-360'
    )
    .length

  const bolsasManualMovements = manualMovements
    ?.filter(movement =>
         movement.inventoryElementFrom?.code === 'bolsa-360'
      || movement.inventoryElementTo?.code === 'bolsa-360'
    )
    .length

  const pacasManualMovements = manualMovements
    ?.filter(movement =>
         movement.inventoryElementFrom?.code === 'paca-360'
      || movement.inventoryElementTo?.code === 'paca-360'
    )
    .length

  return (
    <Card className={clsx(classes.card, className)} {...otherProps}>
      <CardHeader
        title='Bolsa / Paca 360'
        className={classes.header}
        classes={{
          title: classes.title,
        }}
      />
      <CardContent>
        <Description
          title='Rollos movidos desde bodega'
          text={rollosFromBodega}
        />
        {rollosFromBodega !== rollosRemoved &&
          <Description
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
        {pacasUnpack !== undefined && pacasUnpack > 0 &&
          <Description
            title='Pacas desempacadas'
            text={pacasUnpack}
          />
        }
        <Description
          title='Pacas vendidas'
          text={pacasSold}
        />
        {pacasSoldRollbackAmount !== undefined && pacasSoldRollbackAmount > 0 &&
          <Description
            title='Cantidad de ventas de pacas reversadas'
            text={pacasSoldRollbackAmount}
          />
        }
        {rollosManualMovements !== undefined && rollosManualMovements > 0 &&
          <Description
            title='Movimientos manuales relacionados a rollos'
            text={rollosManualMovements}
          />
        }
        {bolsasManualMovements !== undefined && bolsasManualMovements > 0 &&
          <Description
            title='Movimientos manuales relacionados a bolsas'
            text={bolsasManualMovements}
          />
        }
        {pacasManualMovements !== undefined && pacasManualMovements > 0 &&
          <Description
            title='Movimientos manuales relacionados a pacas'
            text={pacasManualMovements}
          />
        }
      </CardContent>
    </Card>
  )
}

const usePaca360Styles = makeStyles(theme => ({
  card: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
    height: '100%',
  },
  header: {
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
}))

export default Paca360Card
