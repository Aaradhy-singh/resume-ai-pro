import type { GroundedRewrite } from '@/lib/engines/grounded-rewriter';

interface RewriteEngineProps {
  data: Array<GroundedRewrite & { index: number }>;
}

export function RewriteEngine({ data }: RewriteEngineProps) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{
      background: '#0D0D0D',
      border: '1px solid #1F1F1F',
      borderTop: '3px solid #8B5CF6'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #1F1F1F'
      }}>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          color: '#8B5CF6',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>EVIDENCE-BASED REWRITER</p>
        <p style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '22px',
          color: '#F0F0F0',
          fontWeight: 400
        }}>Bullet Improvements</p>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '11px',
          color: '#6B6B6B',
          marginTop: '4px',
          lineHeight: 1.7
        }}>
          Rewrites grounded in your actual experience.
          No invented metrics or unsupported claims.
        </p>
      </div>

      {/* Bullet items */}
      <div style={{ padding: '20px 24px' }}>
        {data.map((item, i) => {
          const hasTextChange = item.rewritten !== item.original;
          const hasNotes = item.transformations.length > 0;

          return (
            <div
              key={i}
              style={{
                marginBottom: i < data.length - 1 ? '24px' : 0,
                paddingBottom: i < data.length - 1 ? '24px' : 0,
                borderBottom: i < data.length - 1
                  ? '1px solid #1A1A1A' : 'none'
              }}
            >
              {/* Bullet number + transformation badges */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '10px',
                  color: '#8B5CF6',
                  background: '#1A0A2A',
                  border: '1px solid #3A1A5A',
                  padding: '2px 8px',
                  letterSpacing: '0.1em'
                }}>
                  BULLET #{item.index + 1}
                </span>
                {item.transformations.map((t, ti) => (
                  <span key={ti} style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: '#9A9A9A',
                    background: '#151515',
                    border: '1px solid #2A2A2A',
                    padding: '2px 8px'
                  }}>{t}</span>
                ))}
              </div>

              {/* Original vs Rewritten — only show side by side if text changed */}
              {hasTextChange ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 32px 1fr',
                  gap: '0',
                  alignItems: 'start'
                }}>
                  {/* Original */}
                  <div style={{
                    background: '#111111',
                    border: '1px solid #2A2A2A',
                    borderLeft: '3px solid #3A3A3A',
                    padding: '14px 16px'
                  }}>
                    <p style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      color: '#5A5A5A',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>ORIGINAL</p>
                    <p style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '12px',
                      color: '#6B6B6B',
                      lineHeight: 1.8,
                      textDecoration: 'line-through',
                      textDecorationColor: '#3A3A3A'
                    }}>{item.original}</p>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    paddingTop: '28px'
                  }}>
                    <span style={{
                      color: '#8B5CF6',
                      fontSize: '16px'
                    }}>→</span>
                  </div>

                  {/* Rewritten */}
                  <div style={{
                    background: '#0F0A1A',
                    border: '1px solid #3A1A5A',
                    borderLeft: '3px solid #8B5CF6',
                    padding: '14px 16px'
                  }}>
                    <p style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      color: '#8B5CF6',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>✓ IMPROVED</p>
                    <p style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '12px',
                      color: '#D4B8FF',
                      lineHeight: 1.8
                    }}>{item.rewritten}</p>
                  </div>
                </div>
              ) : (
                /* No text change — show original + notes only */
                <div style={{
                  background: '#111111',
                  border: '1px solid #2A2A2A',
                  borderLeft: '3px solid #2A2A2A',
                  padding: '14px 16px'
                }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: '#5A5A5A',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>ORIGINAL</p>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '12px',
                    color: '#9A9A9A',
                    lineHeight: 1.8
                  }}>{item.original}</p>
                  {hasNotes && (
                    <div style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #1A1A1A'
                    }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#F59E0B',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '6px'
                      }}>TO STRENGTHEN THIS BULLET:</p>
                      {item.transformations.map((note, ni) => (
                        <p key={ni} style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: '11px',
                          color: '#6B6B6B',
                          lineHeight: 1.7
                        }}>→ {note}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
