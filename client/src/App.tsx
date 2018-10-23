import * as React from 'react'
import { BrowserRouter, Switch } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import theme from './theme'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import * as esCoLocale from 'date-fns/locale/es'

import CheckUser from './Routes/CheckUser'
import RegisterSale from './Routes/RegisterSale'
import AuthCallback from './Routes/AuthCallback'
import SilentAuth from './Routes/SilentAuth'
import Logout from './Routes/Logout'
import MonitorSells from './Routes/MonitorSells'
import Dashboard from './Routes/Dashboard'

import CssBaseline from '@material-ui/core/CssBaseline'

import Route from './AuthRoute'

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esCoLocale}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Switch>
              <Route exact path='/authCallback' component={AuthCallback} />
              <Route exact path='/silentAuth' component={SilentAuth} />
              <Route exact path='/logout' component={Logout} />

              <Route exact private path='/' component={Dashboard} />
              <Route exact private path='/monitor/sells' component={MonitorSells} />
              <Route exact private path='/check' component={CheckUser} />
              <Route exact private path='/sell' component={RegisterSale} />
            </Switch>
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>
      </BrowserRouter>
    )
  }
}

export default App
