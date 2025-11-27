import { ImageResponse } from 'next/server';

export const runtime = 'edge';
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
        {/* Logo - Full SVG Recreation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            position: 'relative',
          }}
        >
          {/* Outer gold circle */}
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #d97706',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Inner gradient circle */}
            <div
              style={{
                width: 210,
                height: 210,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #0891b2 0%, #1e3a8a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Chart bars */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 20 }}>
                <div style={{ width: 16, height: 30, background: '#1e3a8a', borderRadius: 4 }} />
                <div style={{ width: 16, height: 40, background: '#3b82f6', borderRadius: 4 }} />
                <div style={{ width: 16, height: 60, background: '#10b981', borderRadius: 4 }} />
              </div>

              {/* Crescent moon (bottom-left) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: 15,
                  width: 25,
                  height: 35,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  boxShadow: 'inset 8px 0px 0px #0891b2',
                }}
              />

              {/* Star (bottom-right) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 25,
                  right: 25,
                  fontSize: 28,
                  color: '#fbbf24',
                  textShadow: '0 2px 8px rgba(251, 191, 36, 0.6)',
                }}
              >
                ✦
              </div>
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

