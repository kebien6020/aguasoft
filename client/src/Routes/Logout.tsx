import * as React from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'

type LogoutProps = AuthRouteComponentProps<{}>

export default class Logout extends React.Component<LogoutProps> {

  componentWillMount() {
    this.props.auth.logout()
    this.props.history.push('/')
  }

  render() {
    return <p>Cerrando sesion</p>
  }
}
