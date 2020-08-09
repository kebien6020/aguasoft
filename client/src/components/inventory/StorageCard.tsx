import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import { Storage, InventoryElement, StorageState } from '../../models'

interface StorageCardProps {
  storage: Storage
  storageStates: StorageState[]
  inventoryElements: InventoryElement[]
}

const StorageCard = (props: StorageCardProps): JSX.Element => {
  const classes = useStyles()

  const { storage, storageStates, inventoryElements } = props
  const ownStorageStates = storageStates.filter(state => state.storageId === storage.id)
  return (
    <Card className={classes.card}>
      <CardHeader
        title={storage.name}
        className={classes.header}
        classes={{
          title: classes.title,
        }}
      />
      <CardContent>
        {ownStorageStates.map(state => {
          const inventoryElement = inventoryElements
            .find(element => element.id === state.inventoryElementId)

          const elemName = inventoryElement ? inventoryElement.name : 'Desconocido'

          return (
            <div key={state.inventoryElementId}>
              <strong>{elemName}</strong>: {state.quantity}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles(theme => ({
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

export default StorageCard
