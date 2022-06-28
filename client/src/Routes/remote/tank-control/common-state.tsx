import * as React from 'react'
import { styled, Typography } from '@material-ui/core'
import { Tank } from './model'

interface LedOwnProps {
  on: boolean
}

export type LedProps = LedOwnProps & React.HTMLAttributes<HTMLDivElement>

export const Led = styled(
  ({ on, ...props }: LedProps) => <div {...props} />
)(({ on }: LedProps) => ({
  borderRadius: '50%',
  backgroundColor: on ? 'lime' : 'transparent',
  width: 16,
  height: 16,
  marginRight: 4,
  border: '1px solid #00000080',
}))

export interface LevelProps {
  name: string
  hi?: boolean
  lo?: boolean
}

export const Level = ({ name, hi, lo }: LevelProps): JSX.Element => {
  return (
    <LevelWrapper>
      <Typography>{name}</Typography>
      <Typography>{levelState(hi, lo)}</Typography>
    </LevelWrapper>
  )
}

const LevelWrapper = styled('div')({
  display: 'flex',
  '& > *': {
    flex: 1,
  },
})

const levelState = (hi: boolean|undefined, lo: boolean|undefined) => {
  if (hi === undefined && lo === undefined) return 'Desconocido'
  if (lo === undefined) return hi ? 'Lleno' : 'Intermedio o vacío'
  if (hi === undefined) return lo ? 'Intermedio o lleno' : 'Vacío'

  if (!lo) return 'Vacío'
  return hi ? 'Lleno' : 'Intermedio'
}

export const showTank = (tank: Tank|undefined): string => {
  const lookup = {
    tank1: 'Tanque 1',
    tank2: 'Tanque 2',
    unknown: 'Desconocido',
  } as Record<string, string>
  return lookup[tank ?? 'unknown']
}
