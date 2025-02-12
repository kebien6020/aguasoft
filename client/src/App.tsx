import { CssBaseline, GlobalStyles } from '@mui/material'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3' // v3 and v4
import { lazy, Suspense } from 'react'
import { BrowserRouter, Redirect, Switch } from 'react-router-dom'
import Auth from './Auth'
import AuthContext from './AuthContext'
import LoadingScreen from './components/LoadingScreen'
import { useSnackbar } from './components/MySnackbar'
import { UserProvider } from './hooks/useUser'
import SnackbarContext from './SnackbarContext'
import theme from './theme'
import { es } from 'date-fns/locale/es'

const Route = lazy(() => import(/* webpackChunkName: "auth-route" */ './AuthRoute'))
const CheckUser = lazy(() => import(/* webpackChunkName: "check-user" */ './Routes/CheckUser'))
const AuthCallback = lazy(() => import(/* webpackChunkName: "auth-callback" */ './Routes/AuthCallback'))
const SilentAuth = lazy(() => import(/* webpackChunkName: "silent-auth" */ './Routes/SilentAuth'))
const Logout = lazy(() => import(/* webpackChunkName: "logout" */ './Routes/Logout'))
const MonitorSells = lazy(() => import(/* webpackChunkName: "monitor-sells" */ './Routes/MonitorSells'))
const ClientEditor = lazy(() => import(/* webpackChunkName: "client-editor" */ './Routes/ClientEditor'))
const ClientList = lazy(() => import(/* webpackChunkName: "client-list" */ './Routes/ClientList'))
const ClientBalance = lazy(() => import(/* webpackChunkName: "client-balance" */ './Routes/ClientBalance'))
const RegisterPayment = lazy(() => import(/* webpackChunkName: "register-payment" */ './Routes/RegisterPayment'))
const PaymentList = lazy(() => import(/* webpackChunkName: "all-payments" */ './Routes/PaymentList'))
const RegisterSpending = lazy(() => import(/* webpackChunkName: "register-spending" */ './Routes/RegisterSpending'))
const SpendingList = lazy(() => import(/* webpackChunkName: "spending-list" */ './Routes/SpendingList'))
const Sells = lazy(() => import(/* webpackChunkName: "sells" */ './Routes/Sells'))
const Payments = lazy(() => import(/* webpackChunkName: "payments" */ './Routes/Payments'))
const Spendings = lazy(() => import(/* webpackChunkName: "spendings" */ './Routes/Spendings'))
const Inventory = lazy(() => import(/* webpackChunkName: "inventory" */ './Routes/Inventory'))
const Movements = lazy(() => import(/* webpackChunkName: "movements" */ './Routes/Movements'))
const RegisterProduction = lazy(() => import(/* webpackChunkName: "register-production" */ './Routes/RegisterProduction'))
const RegisterDamaged = lazy(() => import(/* webpackChunkName: "register-damaged" */ './Routes/RegisterDamaged'))
const RegisterUnpack = lazy(() => import(/* webpackChunkName: "register-damaged" */ './Routes/RegisterUnpack'))
const RegisterRelocation = lazy(() => import(/* webpackChunkName: "register-relocation" */ './Routes/RegisterRelocation'))
const RegisterEntry = lazy(() => import(/* webpackChunkName: "register-entry" */ './Routes/RegisterEntry'))
const Balance = lazy(() => import(/* webpackChunkName: "balance" */ './Routes/Balance'))
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './Routes/dashboard/index'))
const BillingSummary = lazy(() => import(/* webpackChunkName: "tools-billing-summary" */ './Routes/tools/BillingSummary'))
const Batches = lazy(() => import(/* webpackChunkName: "batches" */ './Routes/Batches'))
const RegisterSale2 = lazy(() => import(/* webpackChunkName: "register-sale2" */ './Routes/sale/Register'))

const auth = new Auth()

const AppSwitch = () => (
  <Switch>
    <Route exact path='/authCallback' component={AuthCallback} />
    <Route exact path='/silentAuth' component={SilentAuth} />
    <Route exact path='/logout' component={Logout} />

    <Route exact private path='/check' component={CheckUser} />

    <Route exact private path='/sell2' component={RegisterSale2} />
    <Route exact private path='/sells' component={Sells} />
    <Route exact private path='/monitor/sells' component={MonitorSells} />

    <Route exact private path='/clients' component={ClientList} />
    <Route exact private path='/clients/new' component={ClientEditor} />
    <Route exact private path='/clients/:id' component={ClientEditor} />
    <Route exact private path='/clients/:id/balance' component={ClientBalance} />

    <Route exact private path='/payment' component={RegisterPayment} />
    <Route exact private path='/payments' component={Payments} />
    <Route exact private path='/payments/list' component={PaymentList} />

    <Route exact private path='/spending' component={RegisterSpending} />
    <Route exact private path='/spendings' component={Spendings} />
    <Route exact private path='/spendings/list' component={SpendingList} />

    <Route exact private path='/inventory' component={Inventory} />

    <Route exact private path='/movements' component={Movements} />
    <Route exact private path='/movements/production' component={RegisterProduction} />
    <Route exact private path='/movements/damaged' component={RegisterDamaged} />
    <Route exact private path='/movements/unpack' component={RegisterUnpack} />
    <Route exact private path='/movements/relocation' component={RegisterRelocation} />
    <Route exact private path='/movements/entry' component={RegisterEntry} />

    <Route exact private path='/balance' component={Balance} />

    <Route exact private path='/dashboard' component={Dashboard} />

    <Route exact private path='/batches' component={Batches} />

    <Route exact private path='/tools/billing-summary' component={BillingSummary} />

    <Route exact path='/' render={() => <Redirect to='/sells' />} />
  </Switch>
)

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [snackbar, showMessage] = useSnackbar()

  return (
    (<AuthContext.Provider value={auth}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <BrowserRouter>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <LegacyThemeProvider theme={theme}>
                <SnackbarContext.Provider value={showMessage}>
                  {snackbar}
                  <UserProvider>
                    {children}
                  </UserProvider>
                </SnackbarContext.Provider>
              </LegacyThemeProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </AuthContext.Provider>)
  )
}

const MyGlobalStyles = () => (
  <GlobalStyles
    styles={theme => ({
      html: {
        fontSize: 12,
        [theme.breakpoints.up('sm')]: {
          fontSize: 16,
        },
        [theme.breakpoints.up('md')]: {
          fontSize: 18,
        },
      },
    })}
  />
)

const App = () => {
  return (
    <Providers>
      <CssBaseline />
      <MyGlobalStyles />
      <Suspense fallback={<LoadingScreen text='Cargando página…' />}>
        <AppSwitch />
      </Suspense>
    </Providers>
  )
}

export default App
