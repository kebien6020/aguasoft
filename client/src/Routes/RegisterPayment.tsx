import * as React from 'react'

import { AuthRouteComponentProps } from '../AuthRoute'

interface Props extends AuthRouteComponentProps<{}> {

}

class RegisterPayment extends React.Component<Props> {
  render() {
    return (
      <p>Hit!</p>
    )
  }
}

export default RegisterPayment
