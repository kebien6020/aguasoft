import { Typography } from '@mui/material'
import { Component, type ReactNode } from 'react'

export type GlobalErrorBoundaryProps = {
  children: ReactNode
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps> {
  state: { error: Error | undefined }

  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    this.state = { error: undefined }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <>
          <Typography variant='h4'>
            Se ha producido un error al mostrar la página
          </Typography>
          <Typography variant='body1'>
            Enviar captura de pantalla incluyendo el siguiente mensaje:
          </Typography>
          <code>
            <pre style={{ fontSize: 10, textWrap: 'wrap' }}>
              {error.message}{'\n'}
              {location.href}{'\n'}{'\n'}
              {error.stack}
            </pre>
          </code>
        </>
      )
    }

    return this.props.children
  }
}
