import { CssBaseline, GlobalStyles } from '@mui/material'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3' // v3 and v4
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Auth from './Auth'
import AuthContext from './AuthContext'
import LoadingScreen from './components/LoadingScreen'
import { useSnackbar } from './components/MySnackbar'
import { UserProvider } from './hooks/useUser'
import SnackbarContext from './SnackbarContext'
import theme from './theme'
import { es } from 'date-fns/locale/es'
import { RequireAuth } from './RequireAuth'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const CheckUser = lazy(() => import(/* webpackChunkName: "check-user" */ './Routes/CheckUser'))
const Logout = lazy(() => import(/* webpackChunkName: "logout" */ './Routes/Logout'))
const ClientEditor = lazy(() => import(/* webpackChunkName: "client-editor" */ './Routes/client-editor/index'))
const ClientList = lazy(() => import(/* webpackChunkName: "client-list" */ './Routes/client-list/index'))
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
const RegisterSale = lazy(() => import(/* webpackChunkName: "register-sale" */ './Routes/sale/Register'))
const ExternalLogin = lazy(() => import(/* webpackChunkName: "external-login" */ './Routes/ExternalLogin'))
const Error404 = lazy(() => import(/* webpackChunkName: "error-404" */ './Routes/Error404'))
const CreditBalance = lazy(() => import(/* webpackChunkName: "client-balance" */ './Routes/CreditBalance'))

const AppSwitch = () => (
  <Routes>
    <Route path='/logout' element={<Logout />} />
    <Route path='/login' element={<ExternalLogin />} />

    <Route path='/check' element={<RequireAuth><CheckUser /></RequireAuth>} />

    <Route path='/sells' element={<RequireAuth><Sells /></RequireAuth>} />
    <Route path='/sell' element={<RequireAuth><RegisterSale /></RequireAuth>} />

    <Route path='/clients' element={<RequireAuth><ClientList /></RequireAuth>} />
    <Route path='/clients/new' element={<RequireAuth><ClientEditor /></RequireAuth>} />
    <Route path='/clients/balance' element={<RequireAuth><CreditBalance /></RequireAuth>} />
    <Route path='/clients/:id' element={<RequireAuth><ClientEditor /></RequireAuth>} />
    <Route path='/clients/:id/balance' element={<RequireAuth><ClientBalance /></RequireAuth>} />

    <Route path='/payment' element={<RequireAuth><RegisterPayment /></RequireAuth>} />
    <Route path='/payments' element={<RequireAuth><Payments /></RequireAuth>} />
    <Route path='/payments/list' element={<RequireAuth><PaymentList /></RequireAuth>} />

    <Route path='/spending' element={<RequireAuth><RegisterSpending /></RequireAuth>} />
    <Route path='/spendings' element={<RequireAuth><Spendings /></RequireAuth>} />
    <Route path='/spendings/list' element={<RequireAuth><SpendingList /></RequireAuth>} />

    <Route path='/inventory' element={<RequireAuth><Inventory /></RequireAuth>} />

    <Route path='/movements' element={<RequireAuth><Movements /></RequireAuth>} />
    <Route path='/movements/production' element={<RequireAuth><RegisterProduction /></RequireAuth>} />
    <Route path='/movements/damaged' element={<RequireAuth><RegisterDamaged /></RequireAuth>} />
    <Route path='/movements/unpack' element={<RequireAuth><RegisterUnpack /></RequireAuth>} />
    <Route path='/movements/relocation' element={<RequireAuth><RegisterRelocation /></RequireAuth>} />
    <Route path='/movements/entry' element={<RequireAuth><RegisterEntry /></RequireAuth>} />

    <Route path='/balance' element={<RequireAuth><Balance /></RequireAuth>} />

    <Route path='/dashboard' element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route path='/tools/billing-summary' element={<RequireAuth><BillingSummary /></RequireAuth>} />

    <Route path='/batches' element={<RequireAuth><Batches /></RequireAuth>} />

    <Route path='/' element={<Navigate to='/sells' />} />
    <Route path='/*' element={<Error404 />} />
  </Routes>
)

const auth = new Auth()
const googleClientId = '327533471227-niedralk7louhbv330rm2lk1r8mgcv9g.apps.googleusercontent.com'

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
                    <GoogleOAuthProvider clientId={googleClientId}>
                      {children}
                    </GoogleOAuthProvider>
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
    <GlobalErrorBoundary>
      <Providers>
        <CssBaseline />
        <MyGlobalStyles />
        <Suspense fallback={<LoadingScreen text='Cargando página…' />}>
          <AppSwitch />
        </Suspense>
      </Providers>
    </GlobalErrorBoundary>
  )
}

export default App
