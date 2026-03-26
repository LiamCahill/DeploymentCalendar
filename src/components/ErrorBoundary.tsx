import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-sm text-center space-y-4">
            <h1 className="text-xl font-semibold text-stone-800">Something went wrong</h1>
            <p className="text-sm text-stone-500">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline text-stone-600 hover:text-stone-900"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
