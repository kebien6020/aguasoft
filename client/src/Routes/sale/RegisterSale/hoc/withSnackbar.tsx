import * as React from 'react'

import useSnackbar from '../../../../hooks/useSnackbar'

export interface WithSnackbarProps {
  showMessage: ReturnType<typeof useSnackbar>
}

export function withSnackbar<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T & Partial<WithSnackbarProps>> {

  const Wrapped = (props: T & Partial<WithSnackbarProps>) => {
    const showMessage = useSnackbar()

    return <Component showMessage={showMessage} {...props} />
  }

  const displayName =
    Component.displayName || Component.name || 'Component'

  Wrapped.displayName = `withSnackbar(${displayName})`

  return Wrapped
}
