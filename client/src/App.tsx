import * as React from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from 'material-ui/styles'
import theme from './theme'
import CheckUser from './Routes/CheckUser'
import Reboot from 'material-ui/Reboot'

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <Reboot />
          <Switch>
            <Route exact path='/'><Redirect to='/check' /></Route>
            <Route exact path='/check' component={CheckUser} />
            
          </Switch>
        </MuiThemeProvider>
      </BrowserRouter>
    )
  }
}

export default App
