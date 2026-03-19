import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    source?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SafeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // FUTURE: Send to observability layer here (e.g., Sentry or PostHog)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 m-4 bg-red-900/10 border border-red-500/20 rounded-lg text-left">
                    <h2 className="text-lg font-bold text-red-500 mb-2">Something went wrong</h2>
                    <p className="text-sm text-red-400/80 mb-4">
                        The application encountered an unexpected error rendering this component.
                    </p>
                    <pre className="text-xs bg-black/50 p-4 rounded-md overflow-x-auto text-red-300 font-mono border border-red-500/10">
                        {this.state.error?.message || 'Unknown render error'}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
