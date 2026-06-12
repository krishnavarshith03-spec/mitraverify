'use client';

import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#030712',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '40px 36px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,51,102,0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(255,51,102,0.08)',
                border: '1px solid rgba(255,51,102,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: 24,
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: 14,
                color: '#94a3b8',
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              An unexpected error occurred. Please refresh the page or contact support
              if the problem persists.
            </p>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: 28,
                  background: 'rgba(255,51,102,0.04)',
                  border: '1px solid rgba(255,51,102,0.12)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <summary
                  style={{
                    fontSize: 12,
                    color: '#ff3366',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    userSelect: 'none',
                  }}
                >
                  {this.state.error.name}: {this.state.error.message.slice(0, 60)}
                  {this.state.error.message.length > 60 ? '…' : ''}
                </summary>
                <pre
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: '#64748b',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.5,
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
