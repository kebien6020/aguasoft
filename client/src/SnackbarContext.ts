import { createContext } from 'react'
import { useSnackbar } from './components/MySnackbar'

type ValueType = ReturnType<typeof useSnackbar>['1']

const SnackbarContext = createContext<ValueType>(null as unknown as ValueType)

export default SnackbarContext
