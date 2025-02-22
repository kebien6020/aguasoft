import type { JSX } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import { Storage, InventoryElement, StorageState } from '../../models'
import { Theme } from '../../theme'

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

const useStyles = makeStyles((theme: Theme) => ({
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
