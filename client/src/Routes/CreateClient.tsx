import * as React from 'react'

import { Redirect } from 'react-router-dom'

import { AuthRouteComponentProps } from '../AuthRoute'
import LoadingScreen from '../components/LoadingScreen'
import { fetchJsonAuth } from '../utils'

interface User {
  id: number
  name: string
  code: string
  role: string
}

interface CreateClientProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface CreateClientState {
  user: User
}

class CreateClient extends React.Component<CreateClientProps, CreateClientState> {

  state = {
    user: null as User
  }

  async componentWillMount() {
    const { props } = this
    const user: User = await fetchJsonAuth('/api/users/getCurrent', props.auth)
    if (user) {
      this.setState({user})
    }
  }

  render() {
    const { state } = this
    if (state.user === null) {
      return <LoadingScreen text='Verificando usuario...' />
    }

    if (state.user.role !== 'admin') {
      return <Redirect to='/check?next=/clients/new&admin=true' push={false} />
    }

    return <p>Hit</p>
  }
}

export default CreateClient
