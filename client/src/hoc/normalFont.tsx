import * as React from 'react'

import { MuiThemeProvider, Theme, createMuiTheme } from '@material-ui/core/styles'

function normalFontTheme(prevTheme: Theme): Theme {
  const options = Object.assign(prevTheme, {
    typography: {
      htmlFontSize: 16,
      useNextVariants: true,
    },
  })

  return createMuiTheme(options)
}

export default function normalFont<P>(
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
