import * as React from 'react'
import { BrowserRouter, Switch, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'
import theme from './theme'

import CheckUser from './Routes/CheckUser'
import RegisterSale from './Routes/RegisterSale'
import AuthCallback from './Routes/AuthCallback'
import SilentAuth from './Routes/SilentAuth'
import Logout from './Routes/Logout'

import Reboot from 'material-ui/Reboot'

import Route from './AuthRoute'

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <Reboot />
          <Switch>
            <Route exact path='/'><Redirect to='/check' /></Route>

            <Route exact path='/authCallback' component={AuthCallback} />
            <Route exact path='/silentAuth' component={SilentAuth} />
            <Route exact path='/logout' component={Logout} />

            <Route exact private path='/check' component={CheckUser} />
            <Route exact private path='/sell' component={RegisterSale} />
          </Switch>
        </MuiThemeProvider>
      </BrowserRouter>
    )
  }
}

export default App
