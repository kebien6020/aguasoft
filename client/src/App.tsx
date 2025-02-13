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

const AppSwitch = () => (
  <Switch>
    <Route exact path='/authCallback'><AuthCallback /></Route>
    <Route exact path='/silentAuth'><SilentAuth /></Route>
    <Route exact path='/logout'><Logout /></Route>

    <Route exact private path='/check'><CheckUser /></Route>

    <Route exact private path='/sell2'><RegisterSale2 /></Route>
    <Route exact private path='/sells'><Sells /></Route>
    <Route exact private path='/monitor/sells'><MonitorSells /></Route>

    <Route exact private path='/clients'><ClientList /></Route>
    <Route exact private path='/clients/new'><ClientEditor /></Route>
    <Route exact private path='/clients/:id'><ClientEditor /></Route>
    <Route exact private path='/clients/:id/balance'><ClientBalance /></Route>

    <Route exact private path='/payment'><RegisterPayment /></Route>
    <Route exact private path='/payments'><Payments /></Route>
    <Route exact private path='/payments/list'><PaymentList /></Route>

    <Route exact private path='/spending'><RegisterSpending /></Route>
    <Route exact private path='/spendings'><Spendings /></Route>
    <Route exact private path='/spendings/list'><SpendingList /></Route>

    <Route exact private path='/inventory'><Inventory /></Route>

    <Route exact private path='/movements'><Movements /></Route>
    <Route exact private path='/movements/production'><RegisterProduction /></Route>
    <Route exact private path='/movements/damaged'><RegisterDamaged /></Route>
    <Route exact private path='/movements/unpack'><RegisterUnpack /></Route>
    <Route exact private path='/movements/relocation'><RegisterRelocation /></Route>
    <Route exact private path='/movements/entry'><RegisterEntry /></Route>

    <Route exact private path='/balance'><Balance /></Route>

    <Route exact private path='/dashboard'><Dashboard /></Route>

    <Route exact private path='/batches'><Batches /></Route>

    <Route exact private path='/tools/billing-summary'><BillingSummary /></Route>

    <Route exact path='/' render={() => <Redirect to='/sells' />} />
  </Switch>
)

const auth = new Auth()

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
