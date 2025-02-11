import * as React from 'react'
import { styled } from '@mui/material/styles'
import Input from '@mui/material/Input'

import { PlusButton, MinusButton } from './square-buttons'

export interface NumericPickerProps {
  value: number
  onChange: (val: number) => unknown
}

export const NumericPicker = (props: NumericPickerProps): JSX.Element => (
  <NoWrap>
    <NumericInput
      type='number'
      value={props.value}
      onFocus={handleNumericFocus}
      onChange={(event) => props.onChange(Number(event.target.value) || 0)}
    />
    <PlusButton onClick={() => props.onChange(props.value + 1)} />
    <MinusButton onClick={() => props.onChange(props.value - 1)}/>
  </NoWrap>
)

const handleNumericFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  const inputElement = event.target
  inputElement.select()
}

const NoWrap = styled('div')({
  display: 'flex',
  flexFlow: 'row nowrap',
})

const NumericInput = styled(Input)(({ theme }) => ({
  width: theme.spacing(6),
  marginRight: theme.spacing(1),
  [theme.breakpoints.down('lg')]: {
    width: theme.spacing(3),
    marginRight: 0,
    fontSize: '1em',
  },
  '& input': {
    textAlign: 'center',
    '-moz-appearance': 'textfield',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}))
