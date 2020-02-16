import { useContext } from 'react'
import SnackbarContext from '../SnackbarContext'

const useSnackbar = () => {
  return useContext(SnackbarContext)
}

export default useSnackbar
