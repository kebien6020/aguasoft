import * as React from 'react'
import { Grid } from '@material-ui/core'

import Layout from '../../../components/Layout'
import { VSpace } from '../../../components/utils'
import adminOnly from '../../../hoc/adminOnly'
import normalFont from '../../../hoc/normalFont'
import { Control } from './control'
import { State } from './state'

const TankControl = () => (
  <Layout title='Tank control'>
    <VSpace />

    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Control />
      </Grid>
      <Grid item xs={12} md={6}>
        <State />
      </Grid>
    </Grid>
  </Layout>
)

export default normalFont(adminOnly(TankControl))
