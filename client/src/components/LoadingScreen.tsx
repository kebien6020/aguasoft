import type { JSX } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import logo from '../logo.png'

const style: React.CSSProperties = {
  display: 'flex',
  minHeight: 'calc(100vh - 64px)',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
}

const LoadingScreen = (props: { text: string, children?: React.ReactNode }): JSX.Element => (
  <>
    <div style={style}>
      <img src={logo} style={{ marginBottom: '32px' }} />
      <div style={{ marginBottom: '16px' }}><CircularProgress /></div>
      <Typography variant="h6">{props.text}</Typography>
      {props.children}
    </div>
  </>
)

export default LoadingScreen
