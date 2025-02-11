import { styled } from '@mui/material/styles'

export interface VSpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export const VSpace = styled('div')(({ size = 16 }: VSpaceProps) => ({
  height: size,
  width: '100%',
}))


export const Center = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
})
