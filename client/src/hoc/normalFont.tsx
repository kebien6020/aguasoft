import * as React from 'react'

import { MuiThemeProvider, Theme, createTheme } from '@material-ui/core/styles'

function normalFontTheme(prevTheme: Theme): Theme {
  const options = Object.assign(prevTheme, {
    typography: {
      htmlFontSize: 16,
      useNextVariants: true,
    },
  })

  return createTheme(options)
}

export default function normalFontadminOnly<P>(
  component: React.ComponentType<P>
): React.ComponentType<P> {
  return class NormalFont extends React.Component<P> {
    render() {
      const Component = component
      const { props } = this

      return (
        <MuiThemeProvider theme={normalFontTheme}>
          <Component {...props} />
        </MuiThemeProvider>
      )
    }
  }
}
