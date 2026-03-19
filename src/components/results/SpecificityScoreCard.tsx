import type { SpecificityReport } from '@/lib/engines/specificity-scorer';

interface Props {
    report: SpecificityReport;
}

const gradeColors: Record<string, string> = {
    A: '#10B981', B: '#0EA5E9', C: '#F59E0B', D: '#F97316', F: '#EF4444'
};

const scoreColors: Record<number, string> = {
    1: '#EF4444', 2: '#F97316', 3: '#F59E0B', 4: '#0EA5E9', 5: '#10B981'
};

const scoreLabels: Record<number, string> = {
    1: 'VAGUE', 2: 'GENERIC', 3: 'NAMED', 4: 'OUTCOME-LINKED', 5: 'SPECIFIC'
};

export function SpecificityScoreCard({ report }: Props) {
    if (!report || report.bullets.length === 0) return null;

    return (
        <div style={{
            background: '#111111',
            border: '1px solid #1F1F1F',
            marginBottom: '16px'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid #1F1F1F',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <div>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#6B6B6B',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: '4px'
                    }}>BULLET POINT ANALYSIS</p>
                    <p style={{
                        fontFamily: 'DM Serif Display, serif',
                        fontSize: '20px',
                        color: '#F0F0F0',
                        fontWeight: 400
                    }}>Claim Specificity Score</p>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '11px',
                        color: '#6B6B6B',
                        marginTop: '4px'
                    }}>
                        Can you defend every bullet point in an interview?
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '40px',
                        color: gradeColors[report.overallGrade],
                        fontWeight: 300,
                        lineHeight: 1
                    }}>{report.overallGrade}</p>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '11px',
                        color: '#6B6B6B'
                    }}>{report.averageScore}/5 avg</p>
                </div>
            </div>

            {/* Distribution bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #1F1F1F' }}>
                <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: '#6B6B6B',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                }}>SCORE DISTRIBUTION</p>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {([1, 2, 3, 4, 5] as const).map(score => {
                        const count = report.distribution[score];
                        const total = report.bullets.length;
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <div key={score} style={{ flex: 1 }}>
                                <div style={{
                                    height: '32px',
                                    background: '#1A1A1A',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${pct}%`,
                                        background: scoreColors[score],
                                        opacity: 0.7,
                                        transition: 'height 600ms ease'
                                    }} />
                                </div>
                                <p style={{
                                    fontFamily: 'DM Mono, monospace',
                                    fontSize: '9px',
                                    color: count > 0 ? scoreColors[score] : '#3A3A3A',
                                    textAlign: 'center',
                                    marginTop: '4px'
                                }}>{score}★ ({count})</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weak bullets — need fixing */}
            {report.weakBullets.length > 0 && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #1F1F1F' }}>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#EF4444',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '10px'
                    }}>NEEDS REWRITING ({report.weakBullets.length})</p>
                    {report.weakBullets.slice(0, 4).map((bullet, i) => (
                        <div key={i} style={{
                            background: '#0D0D0D',
                            border: '1px solid #1F1F1F',
                            borderLeft: `3px solid ${scoreColors[bullet.score]}`,
                            padding: '10px 14px',
                            marginBottom: '8px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}>
                                <span style={{
                                    fontFamily: 'DM Mono, monospace',
                                    fontSize: '9px',
                                    color: scoreColors[bullet.score],
                                    letterSpacing: '0.1em'
                                }}>{bullet.score}★ {scoreLabels[bullet.score]}</span>
                            </div>
                            <p style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '11px',
                                color: '#9A9A9A',
                                lineHeight: 1.6,
                                marginBottom: '6px'
                            }}>"{bullet.text}"</p>
                            {bullet.reasons.map((r, j) => (
                                <p key={j} style={{
                                    fontFamily: 'DM Mono, monospace',
                                    fontSize: '10px',
                                    color: '#6B6B6B',
                                    lineHeight: 1.5
                                }}>→ {r}</p>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Strong bullets */}
            {report.strongBullets.length > 0 && (
                <div style={{ padding: '16px 24px' }}>
                    <p style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#10B981',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '10px'
                    }}>STRONG BULLETS ({report.strongBullets.length})</p>
                    {report.strongBullets.slice(0, 2).map((bullet, i) => (
                        <div key={i} style={{
                            background: '#0D1A14',
                            border: '1px solid #1F1F1F',
                            borderLeft: '3px solid #10B981',
                            padding: '10px 14px',
                            marginBottom: '8px'
                        }}>
                            <span style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '9px',
                                color: '#10B981',
                                letterSpacing: '0.1em'
                            }}>✓ {bullet.score}★ {scoreLabels[bullet.score]}</span>
                            <p style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: '11px',
                                color: '#9A9A9A',
                                lineHeight: 1.6,
                                marginTop: '6px'
                            }}>"{bullet.text}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
