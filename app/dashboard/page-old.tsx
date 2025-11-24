'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut, User } from '@/lib/auth';
import { getDashboardData, DashboardData } from '@/lib/database';
import { MetricCard } from '@/components/MetricCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      setLoading(false); // Show page immediately

      // Load data in background
      const data = await getDashboardData(currentUser.id);
      setDashboardData(data);
    };

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getZakatDisplay = () => {
    if (!dashboardData) return 'Below Nisab - No Zakat Due';
    if (dashboardData.currentSavings < 4000) {
      return 'Below Nisab - No Zakat Due';
    }
    return formatCurrency(dashboardData.zakatOwed);
  };

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      {user && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '10px' }}>Welcome!</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Logged in as: <strong>{user.email}</strong>
          </p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard
          title="Total Income (Current Month)"
          value={loading ? '...' : formatCurrency(dashboardData?.currentMonthIncome || 0)}
        />
        <MetricCard
          title="Total Expenses (Current Month)"
          value={loading ? '...' : formatCurrency(dashboardData?.currentMonthExpenses || 0)}
        />
        <MetricCard
          title="Current Savings"
          value={loading ? '...' : formatCurrency(dashboardData?.currentSavings || 0)}
        />
        <MetricCard
          title="Zakat Owed"
          value={loading ? '...' : getZakatDisplay()}
        />
      </div>

      <div style={{
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <Link
          href="/income"
          style={{
            display: 'block',
            padding: '20px',
            border: '2px solid #0070f3',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: '#0070f3',
            transition: 'all 0.2s',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Manage Income
        </Link>
        <Link
          href="/savings"
          style={{
            display: 'block',
            padding: '20px',
            border: '2px solid #0a0',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: '#0a0',
            transition: 'all 0.2s',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Savings Tracker
        </Link>
        <button
          style={{
            padding: '20px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5',
            cursor: 'not-allowed',
            fontSize: '16px',
            fontWeight: '500',
            color: '#999',
          }}
          disabled
        >
          Manage Expenses (Coming Soon)
        </button>
        <Link
          href="/zakat"
          style={{
            display: 'block',
            padding: '20px',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: '#22c55e',
            transition: 'all 0.2s',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Calculate Zakat
        </Link>
      </div>

      <div style={{
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <Link
          href="/transactions"
          style={{
            display: 'block',
            padding: '20px',
            border: '2px solid #8b5cf6',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: '#8b5cf6',
            transition: 'all 0.2s',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Transaction History
        </Link>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fffacd', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px' }}>Getting Started</h3>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          Your finance tracker is ready! Here&apos;s what you can do:
        </p>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>Add income entries to track money coming in</li>
          <li>Record expenses to monitor spending</li>
          <li>Track zakat payments for religious obligations</li>
          <li>View reports and analytics (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}

