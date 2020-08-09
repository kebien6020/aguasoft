import { useContext, Dispatch, SetStateAction } from 'react'
import SnackbarContext from '../SnackbarContext'

const useSnackbar = (): Dispatch<SetStateAction<string | null>> => {
  return useContext(SnackbarContext)
}

export default useSnackbar
