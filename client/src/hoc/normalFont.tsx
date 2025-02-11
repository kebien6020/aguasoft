import { ComponentType, Component } from 'react'

import { ThemeProvider, StyledEngineProvider, Theme, createTheme } from '@mui/material/styles'


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
  component: ComponentType<P>
): ComponentType<P> {
  return class NormalFont extends Component<P> {
    render() {
      const Component = component
      const { props } = this

      return (
        (<StyledEngineProvider injectFirst>(<ThemeProvider theme={normalFontTheme}>
          <Component {...props} />
        </ThemeProvider>)
        </StyledEngineProvider>)
      )
    }
  }
}
