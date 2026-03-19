import { useNavigate } from "react-router-dom";

export function ResultsLoadingState() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Mono', monospace",
        }}>
            <div style={{ textAlign: 'center' }}>
                {/* Animated spinner — pure CSS, no Tailwind */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #1F1F1F',
                    borderTop: '2px solid #0EA5E9',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 20px',
                }} />
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
                <p style={{
                    fontSize: '11px',
                    color: '#5A5A5A',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>LOADING ANALYSIS</p>
            </div>
        </div>
    );
}

export function ResultsEmptyState() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Mono', monospace",
        }}>
            <div style={{
                textAlign: 'center',
                border: '1px solid #1F1F1F',
                padding: '48px',
                maxWidth: '440px',
            }}>
                <p style={{
                    fontSize: '10px',
                    color: '#F59E0B',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                }}>NO DATA FOUND</p>

                <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '28px',
                    color: '#F0F0F0',
                    fontWeight: 400,
                    marginBottom: '16px',
                    lineHeight: 1.3,
                }}>No Analysis Results</p>

                <p style={{
                    fontSize: '12px',
                    color: '#9A9A9A',
                    lineHeight: 1.8,
                    marginBottom: '32px',
                }}>
                    This page requires an active analysis session.
                    Upload a resume to get started.
                </p>

                <button
                    onClick={() => navigate('/upload')}
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
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
                >
                    Start New Analysis
                </button>
            </div>
        </div>
    );
}
