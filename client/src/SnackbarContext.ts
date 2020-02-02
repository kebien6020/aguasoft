import * as React from 'react'
import { useSnackbar } from './components/MySnackbar';

type ValueType = ReturnType<typeof useSnackbar>['1']

const SnackbarContext = React.createContext<ValueType>(null as unknown as ValueType);

export default SnackbarContext
