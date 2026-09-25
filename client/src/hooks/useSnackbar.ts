import { use, Dispatch, SetStateAction } from 'react'
import SnackbarContext from '../SnackbarContext'

const useSnackbar = (): Dispatch<SetStateAction<string | null>> => {
  return use(SnackbarContext)
}

export default useSnackbar
