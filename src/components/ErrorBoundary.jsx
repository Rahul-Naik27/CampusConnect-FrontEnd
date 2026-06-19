import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ fontFamily: 'Inter,sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Something Went Wrong</h1>
            <p style={{ color: '#a5b4fc', marginBottom: '8px', lineHeight: 1.6 }}>
              An unexpected error occurred. Please refresh the page or go back to home.
            </p>
            {this.state.error && (
              <p style={{ color: '#f87171', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '24px', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
                style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
