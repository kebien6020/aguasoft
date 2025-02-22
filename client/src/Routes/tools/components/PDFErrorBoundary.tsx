import type { JSX } from 'react'
import { Link, Alert } from '@mui/material'
import { Component, ReactNode, SyntheticEvent } from 'react'

export interface ErrorBoundaryProps {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class PDFErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: unknown): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  reloadPage = (event: SyntheticEvent): void => {
    event.preventDefault()
    // eslint-disable-next-line no-self-assign
    location.href = location.href
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Alert severity='error'>
          Sucedió un error al mostrar el PDF. Intenta{' '}
          <Link href='#' onClick={this.reloadPage}>recargar la página</Link>.
        </Alert>
      )
    }

    return <>{this.props.children}</>
  }
}
