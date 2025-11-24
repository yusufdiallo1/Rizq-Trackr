interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

export function MetricCard({ title, value, subtitle, color = '#0070f3' }: MetricCardProps) {
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', color: '#666' }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginTop: '10px', 
        color: color 
      }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
