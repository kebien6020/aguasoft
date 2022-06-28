import * as React from 'react'
import { StatePayload } from './model'
import { useTime } from '../../../hooks/useTime'
import { Card, Divider, CardContent, Typography, CardHeader } from '@material-ui/core'
import { Led, Level, showTank } from './common-state'
import { Center } from '../../../components/utils'
import { differenceInSeconds } from 'date-fns'

export interface Stage1StateProps {
  state?: StatePayload['stage_1']
  led: boolean
}

// eslint-disable-next-line complexity
export const Stage1State = ({ state, led }: Stage1StateProps): JSX.Element => {
  const currState = state?.current_state
  const preFillRange: Interval|undefined =
    state?.pre_fill_start && state?.pre_fill_end
    && {
      start: state.pre_fill_start,
      end: state.pre_fill_end,
    }
  const safetyRange: Interval|undefined =
    state?.safety_start && state?.safety_end
    && {
      start: state.safety_start,
      end: state.safety_end,
    }
  const recirRange: Interval|undefined =
    state?.recir_start && state?.recir_end
    && {
      start: state.recir_start,
      end: state.recir_end,
    }
  const now = useTime()

  return (
    <Card>
      <CardHeader
        avatar={<Led on={led} />}
        title='Tanques Etapa 1'
      />
      <Divider />
      <CardContent>
        <Typography variant='caption'>Estado</Typography>
        <Center>
          <Typography variant='h5'>{stage1StateName(currState)}</Typography>
        </Center>
        {['pre_fill', 'filling', 'recirculating', 'alarm'].includes(currState ?? 'unknown') && <>
          <Divider />
          <Typography variant='caption'>Tanque</Typography>
          <Center>
            <Typography>{showTank(state?.active_tank)}</Typography>
          </Center>
        </>}
        {currState === 'pre_fill' && preFillRange !== undefined && <>
          <Divider />
          <Typography variant='caption'>Tiempo pre-llenado</Typography>
          <Center>
            <Typography>{showTimeRange(now, preFillRange)}</Typography>
          </Center>
        </>}
        {currState === 'filling' && safetyRange !== undefined && <>
          <Divider />
          <Typography variant='caption'>Tiempo de seguridad</Typography>
          <Center>
            <Typography>{showTimeRange(now, safetyRange)}</Typography>
          </Center>
        </>}
        {currState === 'recirculating' && recirRange !== undefined && <>
          <Divider />
          <Typography variant='caption'>Tiempo de recirculado</Typography>
          <Center>
            <Typography>{showTimeRange(now, recirRange)}</Typography>
          </Center>
        </>}
        <Divider />
        <Typography variant='caption'>Sensores de nivel</Typography>
        <>
          <Level name='Tanque 1' hi={state?.sensors?.sensor1Hi} />
          <Level name='Tanque 2' hi={state?.sensors?.sensor2Hi} />
          <Level name='T. Acueducto' lo={state?.sensors?.sensorAqLo} hi={state?.sensors?.sensorAqHi} />
        </>
      </CardContent>
    </Card>
  )
}

const stage1StateName = (stateSlug: string|undefined) => {
  const lookup = {
    stopped: 'Detenido',
    pre_fill: 'Pre-llenado',
    filling: 'Llenando',
    recirculating: 'Recirculando',
    alarm: 'Alarma (tiempo de seguridad)',
    unknown: 'Desconocido',
  } as Record<string, string>
  return lookup[stateSlug ?? 'unknown']
}

const showTimeRange = (now: Date, range: Interval) => {
  const elapsed = differenceInSeconds(now, range.start)
  const total = differenceInSeconds(range.end, range.start)

  return `${showDur(elapsed)} / ${showDur(total)}`
}

const showDur = (secs: number) => {
  const p = (n: number) => String(n).padStart(2, '0')
  const f = Math.floor
  return `${p(f(secs / 60))}:${p(secs % 60)}`
}
