import * as React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'

import Layout from '../components/Layout'
const logo = require('../logo.png')

const style: React.CSSProperties = {
  display: 'flex',
  minHeight: 'calc(100vh - 64px)',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
}

export default (props: {text: string}) => (
  <Layout>
    <div style={style}>
      <img src={logo} style={{marginBottom: '32px'}} />
      <div style={{marginBottom: '16px'}}><CircularProgress /></div>
      <Typography  variant="h6">{props.text}</Typography>
    </div>
  </Layout>
)
