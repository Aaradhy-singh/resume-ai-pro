import type { PortfolioAnalysis } from '@/lib/integrations/githubClient';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Cell, Tooltip as RechartsTooltip
} from 'recharts';

interface PortfolioAnalyzerProps {
  data: PortfolioAnalysis | null;
}

export function PortfolioAnalyzer({ data }: PortfolioAnalyzerProps) {
  const portfolioScore = data?.portfolioScore ?? 0;

  if (!data) return null;

  const chartData = [
    { name: 'Activity', value: data.insights?.activityScore ?? 0, color: '#0EA5E9' },
    { name: 'Quality', value: data.insights?.qualityScore ?? 0, color: '#10B981' },
    { name: 'Diversity', value: data.insights?.diversityScore ?? 0, color: '#F59E0B' },
    { name: 'Docs', value: data.insights?.documentationScore ?? 0, color: '#8B5CF6' },
    { name: 'Consistency', value: data.insights?.consistencyScore ?? 0, color: '#6B6B6B' },
  ];

  const topProjects = (data.topProjects ?? []).slice(0, 3);
  const totalRepos = data.repositoryMetrics?.totalRepos ?? 0;
  const totalStars = data.repositoryMetrics?.totalStars ?? 0;

  return (
    <div style={{
      background: '#0D0D0D',
      border: '1px solid #1F1F1F',
      borderTop: '3px solid #0EA5E9'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #1F1F1F',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: '#0EA5E9',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>GITHUB PORTFOLIO</p>
          <p style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '22px',
            color: '#F0F0F0',
            fontWeight: 400
          }}>Portfolio Strength</p>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: '#6B6B6B',
            marginTop: '4px'
          }}>
            {totalRepos} repositories · {totalStars} stars
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '36px',
            color: portfolioScore >= 70
              ? '#10B981' : portfolioScore >= 40
                ? '#F59E0B' : '#EF4444',
            fontWeight: 300,
            lineHeight: 1
          }}>{portfolioScore}</p>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '10px',
            color: '#6B6B6B'
          }}>/100</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F1F' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          color: '#6B6B6B',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>INSIGHT BREAKDOWN</p>
        <div style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fontSize: 11,
                  fill: '#9A9A9A',
                  fontFamily: 'DM Mono, monospace'
                }}
                width={75}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{
                        background: '#111111',
                        border: '1px solid #2A2A2A',
                        padding: '8px 12px',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '11px',
                        color: '#F0F0F0'
                      }}>
                        {payload[0].payload.name}: {payload[0].value}/100
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                barSize={14}
                background={{ fill: '#1A1A1A' }}
                radius={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Projects */}
      <div style={{ padding: '20px 24px' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          color: '#6B6B6B',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>TOP PROJECTS</p>

        {topProjects.length === 0 ? (
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: '#3A3A3A'
          }}>No public repositories found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topProjects.map(repo => (
              <div key={repo.name} style={{
                background: '#111111',
                border: '1px solid #1F1F1F',
                borderLeft: '3px solid #1F1F1F',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '12px',
                    color: '#F0F0F0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{repo.name}</p>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '4px'
                  }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      color: '#6B6B6B'
                    }}>★ {repo.stars}</span>
                    <span style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      color: '#6B6B6B'
                    }}>⑂ {repo.forks}</span>
                    {repo.language && (
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        color: '#6B6B6B'
                      }}>{repo.language}</span>
                    )}
                  </div>
                </div>
                {repo.hasReadme && (
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    color: '#10B981',
                    background: '#0A1A0A',
                    border: '1px solid #1A3A1A',
                    padding: '2px 6px',
                    marginLeft: '12px',
                    flexShrink: 0
                  }}>README</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
