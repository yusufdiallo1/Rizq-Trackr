'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div style={{
      padding: '50px',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        padding: '30px',
        backgroundColor: '#fee',
        borderRadius: '8px',
        border: '1px solid #fcc'
      }}>
        <h2 style={{
          color: '#c00',
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Something went wrong!
        </h2>
        <p style={{
          color: '#666',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          We encountered an error while loading your dashboard data.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
