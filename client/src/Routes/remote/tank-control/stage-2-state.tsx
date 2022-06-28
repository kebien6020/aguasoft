import * as React from 'react'
import { StatePayload } from './model'
import { Card, CardHeader, Divider, CardContent, Typography } from '@material-ui/core'
import { Led, showTank } from './common-state'
import { Center } from '../../../components/utils'

export interface Stage2StateProps {
  state?: StatePayload['stage_2']
  led: boolean
}
export const Stage2State = ({ state, led }: Stage2StateProps): JSX.Element => {
  const currState = state?.current_state

  return (
    <Card>
      <CardHeader
        avatar={<Led on={led} />}
        title='Tanques etapa 2'
      />
      <Divider />
      <CardContent>
        <Typography variant='caption'>Estado</Typography>
        <Center>
          <Typography variant='h5' align='center'>{stage2StateName(currState)}</Typography>
        </Center>
        {['wait_energy'].includes(currState ?? 'unknown') && <>
          <Divider />
          <Typography variant='caption'>Tanque</Typography>
          <Center>
            <Typography>{showTank(state?.active_tank)}</Typography>
          </Center>
        </>}
      </CardContent>
    </Card>
  )
}

const stage2StateName = (stateSlug: string|undefined) => {
  const lookup = {
    stopped: 'Detenido',
    wait_valve: 'Esperando a configuración manual de válvulas',
    wait_energy: 'Esperando a que la etapa 1 esté detenida',
    transferring: 'Transfiriendo',
    unknown: 'Desconocido',
  } as Record<string, string>
  return lookup[stateSlug ?? 'unknown']
}
