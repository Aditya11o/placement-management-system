import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-2xl w-full relative z-10 animate-fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-14 border border-red-50 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />
              
              <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                <AlertOctagon className="w-12 h-12 text-red-500 drop-shadow-md" />
                <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-full" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                Oops! Something went wrong.
              </h1>
              <p className="text-lg font-bold text-gray-500 mb-10 max-w-lg mx-auto">
                We've encountered an unexpected error. Please refresh the page or head back to the dashboard.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-10 text-left bg-gray-50 rounded-2xl p-6 border border-gray-100 overflow-x-auto">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Error Details</p>
                  <pre className="text-sm font-medium text-red-600 font-mono whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button
                  onClick={this.handleReset}
                  className="w-full md:w-auto px-10 py-4 bg-[#000613] text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-black/10 hover:bg-gray-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full md:w-auto px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black uppercase text-sm tracking-widest hover:border-gray-900 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
