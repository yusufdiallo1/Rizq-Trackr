import { ImageResponse } from '@vercel/og';

export const alt = 'Rizq Trackr - Islamic Finance Tracker';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '8px solid #0891b2',
            }}
          >
            <div
              style={{
                fontSize: 100,
                fontWeight: 'bold',
                color: '#1e3a8a',
              }}
            >
              R
            </div>
          </div>
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Rizq Trackr
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: 1000,
          }}
        >
          Islamic Finance Tracker | Income, Expenses & Zakat
        </div>
        
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            left: 50,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            opacity: 0.3,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

