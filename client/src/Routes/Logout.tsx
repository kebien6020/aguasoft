import { Component } from 'react'
import { AuthRouteComponentProps } from '../AuthRoute'

type LogoutProps = AuthRouteComponentProps<Record<string, never>>

export default class Logout extends Component<LogoutProps> {

  componentDidMount() {
    this.props.auth.logout()
    this.props.history.push('/')
  }

  render() {
    return <p>Cerrando sesion</p>
  }
}
