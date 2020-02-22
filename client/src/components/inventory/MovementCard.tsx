import * as React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Grid from '@material-ui/core/Grid'
import * as moment from 'moment'

import { InventoryMovement, User, Storage, InventoryElement } from '../../models'
import { colors } from '@material-ui/core'
import { movementCauseSlugToText } from '../../constants'

interface DescriptionProps {
  title: React.ReactNode
  text: React.ReactNode
}
const Description = (props: DescriptionProps) => (
  <p style={{marginTop: 0, marginBottom: 0}}>
    <strong style={{fontWeight: 500}}>{props.title}</strong>: {props.text}
  </p>
)

export interface MovementCardProps {
  movement: InventoryMovement
  users: User[]
  storages: Storage[]
  elements: InventoryElement[]
}

const MovementCard = (props: MovementCardProps) => {
  const { movement, users, storages, elements } = props
  const classes = useStyles()

  const user = users.find(u => u.id === movement.createdBy)
  const userName = user ? user.name : 'Desconocido'

  const storageFrom = storages.find(s => s.id === movement.storageFromId)
  const storageFromName = movement.storageFromId ?
    (storageFrom ? storageFrom.name : 'Desconocido')
    : 'Afuera'

  const storageTo = storages.find(s => s.id === movement.storageToId)
  const storageToName = movement.storageToId ?
    (storageTo ? storageTo.name : 'Desconocido')
    : 'Afuera'

  const elementFrom = elements.find(e => e.id === movement.inventoryElementFromId)
  const elementFromName = elementFrom ? elementFrom.name : 'Desconocido'

  const elementTo = elements.find(e => e.id === movement.inventoryElementToId)
  const elementToName = elementTo ? elementTo.name : 'Desconocido'

  const style = {} as React.CSSProperties

  const theme = useTheme()

  if (movement.cause === 'damage') {
    style.borderLeftColor = theme.palette.error.main
  } else if (movement.cause === 'manual') {
    style.borderLeftColor = colors.yellow[500]
  } else if (movement.cause === 'sell') {
    style.borderLeftColor = colors.green[500]
  }

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
          <Grid item xs={12} lg={6}>
            <Description
              title='Elemento'
              text={elementFromName}
            />
            {elementFromName !== elementToName &&
              <Description
                title='Elemento destino'
                text={elementToName}
              />
            }
            <Description
              title='Cantidad'
              text={movement.quantityFrom}
            />
            {movement.quantityFrom !== movement.quantityTo &&
              <Description
                title='Cantidad destino'
                text={movement.quantityTo}
              />
            }
          </Grid>
          <Grid item xs={12} lg={6}>
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
              text={moment(movement.createdAt).format('DD/MMM hh:mm a')}
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

export default MovementCard
