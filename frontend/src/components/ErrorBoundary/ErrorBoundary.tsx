import React, { ErrorInfo, ReactNode } from 'react';
import Card from '../Card/Card';
import Button from '../Button/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            <div className="flex items-center justify-center min-h-screen w-screen bg-slate-50 p-8 box-border">
                <Card className="max-w-[500px] w-full text-center py-12 px-8 flex flex-col items-center gap-6">
                    <div className="bg-red-50 rounded-full p-6 inline-flex mb-2">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-slate-900 m-0 text-2xl font-bold">Oops! Something went wrong.</h2>
                    <p className="text-slate-500 m-0 leading-relaxed">
                        We're sorry, but an unexpected error occurred while loading this page. Our team has been notified.
                    </p>

                    {/* Optional: Show error message in development */}
                    {(import.meta.env.MODE === 'development') && (
                        <div className="bg-slate-100 p-4 rounded-lg w-full overflow-x-auto text-left mt-4 border border-white/20">
                            <code className="text-red-500 text-sm font-mono">{this.state.error?.toString()}</code>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
                        <Button variant="primary" icon={RefreshCw} onClick={this.handleReload} className="w-full sm:w-auto">
                            Reload Page
                        </Button>
                        <Button variant="secondary" icon={Home} onClick={this.handleGoHome} className="w-full sm:w-auto">
                            Return Home
                        </Button>
                    </div>
                </Card>
            </div>
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
