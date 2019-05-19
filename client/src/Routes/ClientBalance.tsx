import * as React from 'react'

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import { AuthRouteComponentProps } from '../AuthRoute'
import adminOnly from '../hoc/adminOnly'

type Props = AuthRouteComponentProps<any> & PropClasses

interface State {

}

class ClientBalance extends React.Component<Props, State> {
  render() {
    return (
      <p>Hit</p>
    )
  }
}

const styles : StyleRulesCallback = (_theme: Theme) => ({
})

export default
  adminOnly(
  withStyles(styles)(
    ClientBalance))
