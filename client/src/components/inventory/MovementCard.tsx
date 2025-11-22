import type { JSX } from 'react'
import { useTheme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

import { InventoryMovement, User, Storage, InventoryElement } from '../../models'
import * as colors from '@mui/material/colors'
import { movementCauseSlugToText } from '../../constants'
import { formatDatetimeCol } from '../../utils'
import type { CSSProperties, ReactNode } from 'react'
import { Theme } from '../../theme'

interface DescriptionProps {
  title: ReactNode
  text: ReactNode
}
const Description = (props: DescriptionProps) => (
  <p style={{ marginTop: 0, marginBottom: 0 }}>
    <strong style={{ fontWeight: 500 }}>{props.title}</strong>: {props.text}
  </p>
)

export interface MovementCardProps {
  movement: InventoryMovement
  users: User[]
  storages: Storage[]
  elements: InventoryElement[]
}

const MovementCard = (props: MovementCardProps): JSX.Element => {
  const { movement, users, storages, elements } = props
  const classes = useStyles()

  const user = users.find(u => u.id === movement.createdBy)
  const userName = user ? user.name : 'Desconocido'

  const storageFrom = storages.find(s => s.id === movement.storageFromId)
  const storageFromName = movement.storageFromId
    ? (storageFrom ? storageFrom.name : 'Desconocido')
    : 'Afuera'

  const storageTo = storages.find(s => s.id === movement.storageToId)
  const storageToName = movement.storageToId
    ? (storageTo ? storageTo.name : 'Desconocido')
    : 'Afuera'

  const elementFrom = elements.find(e => e.id === movement.inventoryElementFromId)
  const elementFromName = elementFrom ? elementFrom.name : 'Desconocido'

  const elementTo = elements.find(e => e.id === movement.inventoryElementToId)
  const elementToName = elementTo ? elementTo.name : 'Desconocido'

  const style = {} as CSSProperties

  const theme = useTheme()

  if (movement.cause === 'damage')
    style.borderLeftColor = theme.palette.error.main
  else if (movement.cause === 'manual')
    style.borderLeftColor = colors.yellow[500]
  else if (movement.cause === 'sell')
    style.borderLeftColor = colors.green[500]


  return (
    <Card className={classes.card} style={style}>
      <CardHeader
        title={movementCauseSlugToText(movement.cause) + (movement.rollback ? ' (Reversada)' : '')}
        className={classes.header}
        classes={{
          title: classes.title,
        }}
      />
      <CardContent>
        <Grid container>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Description
              title='Elemento'
              text={elementFromName}
            />
            {elementFromName !== elementToName
              && <Description
                title='Elemento destino'
                text={elementToName}
              />
            }
            <Description
              title='Cantidad'
              text={movement.quantityFrom}
            />
            {movement.quantityFrom !== movement.quantityTo
              && <Description
                title='Cantidad destino'
                text={movement.quantityTo}
              />
            }
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Description
              title='Desde'
              text={storageFromName}
            />
            <Description
              title='Hacia'
              text={storageToName}
            />
            <Description
              title='Fecha'
              text={formatDatetimeCol(movement.createdAt)}
            />
            <Description
              title='Creado por'
              text={userName}
            />
          </Grid>
        </Grid>
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

export default MovementCard
