import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    fontFamily: "'DM Mono', monospace",
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '480px',
                        border: '1px solid #1F1F1F',
                        padding: '48px',
                    }}>
                        <p style={{
                            fontSize: '10px',
                            color: '#EF4444',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '16px',
                        }}>APPLICATION ERROR</p>

                        <p style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '28px',
                            color: '#F0F0F0',
                            fontWeight: 400,
                            marginBottom: '16px',
                            lineHeight: 1.3,
                        }}>Something went wrong</p>

                        <p style={{
                            fontSize: '12px',
                            color: '#9A9A9A',
                            lineHeight: 1.8,
                            marginBottom: '32px',
                        }}>
                            An unexpected error occurred. Your data is safe.
                            Reload the page to continue.
                        </p>

                        <button
                            aria-label="Reload Application"
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#0EA5E9',
                                color: '#000000',
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '12px',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                padding: '12px 28px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 150ms ease',
                                marginBottom: '24px',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
                        >
                            Reload Application
                        </button>

                        {/* Show error in dev only — remove stack trace from UI */}
                        {import.meta.env.DEV && this.state.error && (
                            <pre style={{
                                marginTop: '24px',
                                padding: '16px',
                                background: '#0D0D0D',
                                border: '1px solid #1F1F1F',
                                textAlign: 'left',
                                overflow: 'auto',
                                maxHeight: '160px',
                                fontSize: '11px',
                                color: '#EF4444',
                                fontFamily: "'DM Mono', monospace",
                                lineHeight: 1.6,
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
