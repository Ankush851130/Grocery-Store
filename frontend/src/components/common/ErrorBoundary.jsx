import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
          <div className="max-w-2xl w-full bg-slate-800 rounded-3xl p-8 border border-red-500/30 shadow-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-bold uppercase text-red-400 border border-red-500/30">
              ⚠️ React Runtime Error Caught
            </div>
            <h1 className="text-2xl font-black text-white">Something went wrong while loading the page</h1>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700 text-sm font-mono text-red-400 overflow-x-auto">
              <p className="font-bold">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-xs text-slate-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
