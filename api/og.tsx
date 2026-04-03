import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score') ?? '0';
  const role = searchParams.get('role') ?? 'Software Engineer';
  const stage = searchParams.get('stage') ?? 'student';

  const scoreNum = parseInt(score);
  const scoreColor = scoreNum >= 70 ? '#ffffff' : scoreNum >= 40 ? '#999999' : '#555555';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Top border line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: '#1a1a1a',
          display: 'flex',
        }} />

        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '11px',
            color: '#444444',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}>
            RESUMEAI PRO — RESUME ANALYSIS INTELLIGENCE
          </div>
          <div style={{
            fontSize: '13px',
            color: '#333333',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}>
            DIAGNOSTIC REPORT
          </div>
        </div>

        {/* Center section */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '48px' }}>
          {/* Score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              color: '#444444',
              letterSpacing: '0.2em',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}>
              OVERALL SCORE
            </div>
            <div style={{
              fontSize: '140px',
              color: scoreColor,
              lineHeight: 1,
              fontFamily: 'serif',
              fontWeight: 'bold',
            }}>
              {score}
            </div>
            <div style={{
              fontSize: '24px',
              color: '#333333',
              fontFamily: 'monospace',
            }}>
              / 100
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: '1px',
            height: '160px',
            background: '#1a1a1a',
            display: 'flex',
            marginBottom: '24px',
          }} />

          {/* Role and stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '11px',
                color: '#444444',
                letterSpacing: '0.2em',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}>
                TARGET ROLE
              </div>
              <div style={{
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'serif',
                maxWidth: '500px',
              }}>
                {role}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                fontSize: '11px',
                color: '#444444',
                letterSpacing: '0.2em',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}>
                CAREER STAGE
              </div>
              <div style={{
                fontSize: '18px',
                color: '#666666',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {stage}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #1a1a1a',
          paddingTop: '24px',
        }}>
          <div style={{
            fontSize: '13px',
            color: '#333333',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}>
            resume-ai-pro-psi.vercel.app
          </div>
          <div style={{
            fontSize: '11px',
            color: '#333333',
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
          }}>
            FREE — NO ACCOUNT — BROWSER NATIVE
          </div>
        </div>

        {/* Bottom border line */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '1px',
          background: '#1a1a1a',
          display: 'flex',
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
