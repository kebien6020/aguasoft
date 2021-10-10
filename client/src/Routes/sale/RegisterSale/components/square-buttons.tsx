import * as React from 'react'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

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
