import * as React from 'react'
import { styled, Typography, TypographyProps } from '@material-ui/core'

export type VSpaceProps = JSX.IntrinsicElements['div'] & {
  size?: number
}
export const VSpace = ({ size = 16, ...props }: VSpaceProps): JSX.Element =>
  <div style={{ height: size }} {...props} />

export const Center = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

export const Title1 = (props: TypographyProps<'h1'>): JSX.Element =>
  <Typography component='h1' variant='h6' color='primary' gutterBottom {...props} />
