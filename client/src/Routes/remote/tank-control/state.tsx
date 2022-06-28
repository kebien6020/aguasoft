import * as React from 'react'
import { useMemo, useState, useCallback } from 'react'
import { IconButton } from '@material-ui/core'
import UpdateIcon from '@material-ui/icons/Refresh'
import * as socketIo from 'socket.io-client'

import { VSpace, Title1 } from '../../../components/utils'
import { StatePayload } from './model'
import { useApi } from '../../../api'
import { subMilliseconds, addMilliseconds } from 'date-fns'
import { sleep } from '../../../utils'
import { AqueductState } from './aq-state'
import { Stage1State } from './stage-1-state'
import { Stage2State } from './stage-2-state'

export const State = (): JSX.Element => {
  const [deviceState, setDeviceState] = useState<StatePayload>({
    stage_1: undefined,
    stage_2: undefined,
    aqueduct_fsm: undefined,
  })

  const [updateIndicator, setUpdateIndicator] = useState({
    stage_1: false,
    stage_2: false,
    aqueduct_fsm: false,
  })

  const api = useApi()
  const requestState = useCallback(() =>
    api
      .post('remote/action/agua-tank-control/state')
      .json()
      .catch(console.error)
  , [api])

  useMemo(() => {
    const io = socketIo('/')

    io.on('connect', () => {
      io.emit('join', { room: 'frontend_agua-tank-control' })
    })

    io.on('joined', requestState)

    io.on('state', (state: StatePayload) => {
      const now = new Date()
      if (state.aqueduct_fsm) {
        state.aqueduct_fsm.filling_time =
          subMilliseconds(now, state.aqueduct_fsm.filling_duration)
      }

      if (state.stage_1) {
        const st = state.stage_1
        st.pre_fill_start =
          subMilliseconds(now, st.pre_fill_elapsed)
        st.pre_fill_end =
          addMilliseconds(st.pre_fill_start, st.pre_fill_total)

        st.safety_start =
          subMilliseconds(now, st.safety_elapsed)
        st.safety_end =
          addMilliseconds(st.safety_start, st.safety_total)

        st.recir_start =
          subMilliseconds(now, st.recir_elapsed)
        st.recir_end =
          addMilliseconds(st.recir_start, st.recir_total)
      }

      setDeviceState(prev => ({ ...prev, ...state }))
      Object.keys(state).map(async (updatedKey) => {
        setUpdateIndicator(prev => ({ ...prev, [updatedKey]: true }))
        await sleep(200)
        setUpdateIndicator(prev => ({ ...prev, [updatedKey]: false }))
      })
    })

    return io
  }, [requestState])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title1 style={{ flex: 1 }}>
                Estado
        </Title1>
        <IconButton onClick={requestState}><UpdateIcon /></IconButton>
      </div>
      <AqueductState
        state={deviceState.aqueduct_fsm}
        led={updateIndicator.aqueduct_fsm}
      />
      <VSpace />
      <Stage1State
        state={deviceState.stage_1}
        led={updateIndicator.stage_1}
      />
      <VSpace />
      <Stage2State
        state={deviceState.stage_2}
        led={updateIndicator.stage_2}
      />
    </>
  )
}
