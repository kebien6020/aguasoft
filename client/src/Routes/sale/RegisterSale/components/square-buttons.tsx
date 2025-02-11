import * as React from 'react'

import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface SqIconButtonProps {
  children: JSX.Element
  onClick: () => unknown
}
const SqIconButton = ({ children, onClick }: SqIconButtonProps) => (
  <Button
    disableRipple
    onClick={onClick}
    size='small'
    variant='contained'
    color='secondary'
  >
    {children}
  </Button>
)

export interface PlusButtonProps { onClick: () => unknown }
export const PlusButton = (props: PlusButtonProps): JSX.Element => (
  <SqIconButton onClick={props.onClick}><AddIcon /></SqIconButton>
)

export interface MinusButtonProps { onClick: () => unknown }
export const MinusButton = (props: MinusButtonProps): JSX.Element => (
  <SqIconButton onClick={props.onClick}><RemoveIcon /></SqIconButton>
)
