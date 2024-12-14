import { styled } from '@material-ui/core'
import React from 'react'

export interface VSpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export const VSpace = styled('div')(({ size = 16 }: VSpaceProps) => ({
  height: size,
  width: '100%',
}))

