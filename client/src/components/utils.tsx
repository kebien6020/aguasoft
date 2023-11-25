import { styled } from '@material-ui/core'

export const Center = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

export const CenterFullscreen = styled(Center)({
  minHeight: 'calc(100vh - 64px)',
})
