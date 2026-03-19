import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Large decorative 404 */}
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '160px',
          color: '#1A1A1A',
          lineHeight: 1,
          userSelect: 'none',
          marginBottom: '0',
        }}>404</p>

        {/* Label */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          color: '#0EA5E9',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '16px',
          marginTop: '-16px',
        }}>PAGE NOT FOUND</p>

        {/* Message */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '13px',
          color: '#9A9A9A',
          lineHeight: 1.8,
          marginBottom: '40px',
          maxWidth: '360px',
          margin: '0 auto 40px',
        }}>
          The page at{' '}
          <span style={{ color: '#F0F0F0' }}>{location.pathname}</span>
          {' '}does not exist.
        </p>

        {/* CTA */}
        <Link
          to="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#0EA5E9',
            color: '#000000',
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '12px 28px',
            textDecoration: 'none',
            border: 'none',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
        >
          ← Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
