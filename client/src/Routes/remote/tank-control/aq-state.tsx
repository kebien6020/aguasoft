import * as React from 'react'
import { StatePayload } from './model'
import { useTime } from '../../../hooks/useTime'
import { Card, CardHeader, Divider, CardContent, Typography } from '@material-ui/core'
import { Center } from '../../../components/utils'
import { Led, Level } from './common-state'
import { intervalToDuration, formatDuration } from 'date-fns'
import { es } from 'date-fns/locale'

export interface AqueductStateProps {
  state?: StatePayload['aqueduct_fsm']
  led: boolean
}

export const AqueductState = ({ state, led }: AqueductStateProps): JSX.Element => {
  const currState = state?.current_state
  const now = useTime()
  return (
    <Card>
      <CardHeader
        avatar={<Led on={led} />}
        title='Acueducto'
      />
      <Divider />
      <CardContent>
        <Typography variant='caption'>Estado</Typography>
        <Center>
          <Typography variant='h5'>{aqueductStateName(currState)}</Typography>
        </Center>
        {(currState === 'filling' || currState === 'filling_pump') && <>
          <Divider />
          <Typography variant='caption'>Tiempo llenando</Typography>
          <Center>
            <Typography>{showAqFillingTime(state?.filling_time, now)}</Typography>
          </Center>
        </>}
        <Divider />
        <Typography variant='caption'>Sensores de nivel</Typography>
        <>
          <Level name='T. Acueducto' lo={state?.sensors?.sensorAqLo} hi={state?.sensors?.sensorAqHi} />
        </>
      </CardContent>
    </Card>
  )
}

const aqueductStateName = (stateSlug: string|undefined) => {
  const lookup = {
    stopped: 'Detenido',
    filling: 'Llenando',
    filling_pump: 'Llenando + bomba',
    unknown: 'Desconocido',
  } as Record<string, string>
  return lookup[stateSlug ?? 'unknown']
}

const showAqFillingTime = (start: Date|undefined, now: Date) => {
  if (!start) return null

  const dur = intervalToDuration({ start, end: now })
  return formatDuration(dur, {
    locale: es,
    format: ['hours', 'minutes', 'seconds'],
    zero: true,
  })
}
