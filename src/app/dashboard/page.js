"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PlayerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [registrations, setRegistrations] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setMatchResults(data.matchResults);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white' }}><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-white)' }}>
      <nav className="navbar scrolled">
        <div className="container">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">🔥</div>
            <span>FF ARENA</span>
          </Link>
          <div className="nav-links">
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <h1 style={{ marginBottom: '10px' }}>Welcome, {session?.user?.name}!</h1>
        <p className="text-muted" style={{ marginBottom: '40px' }}>Here is your personalized tournament status and match history.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          
          {/* Registrations Section */}
          <div>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>My Registrations</h3>
            {registrations.length === 0 ? (
              <div style={{ background: 'var(--bg-charcoal)', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-muted" style={{ marginBottom: '20px' }}>You haven't registered for any tournaments yet.</p>
                <Link href="/#tournaments" className="btn btn-primary btn-sm">Find Tournaments</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {registrations.map(reg => (
                  <div key={reg.id} style={{ 
                    background: 'var(--bg-charcoal)', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-orange)', marginBottom: '5px' }}>{reg.tournament.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <strong>Team:</strong> {reg.teamName || reg.captainName} | <strong>Type:</strong> {reg.type.toUpperCase()} | <strong>Date:</strong> {new Date(reg.tournament.scheduledDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div style={{ textAlign: 'right', marginBottom: reg.status === 'APPROVED' && reg.tournament.roomId ? '15px' : '0' }}>
                        <span style={{ 
                          padding: '8px 16px', 
                          borderRadius: '50px', 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold',
                          background: reg.status === 'APPROVED' ? 'rgba(0,200,100,0.1)' : reg.status === 'REJECTED' ? 'rgba(255,45,45,0.1)' : 'rgba(255,255,255,0.1)',
                          color: reg.status === 'APPROVED' ? '#00cc66' : reg.status === 'REJECTED' ? '#ff2d2d' : '#ccc',
                          border: `1px solid ${reg.status === 'APPROVED' ? '#00cc66' : reg.status === 'REJECTED' ? '#ff2d2d' : '#555'}`
                        }}>
                          {reg.status}
                        </span>
                      </div>
                      
                      {reg.status === 'APPROVED' && reg.tournament.roomId && (
                        <div style={{ background: 'rgba(0, 200, 255, 0.1)', border: '1px solid var(--accent-blue)', padding: '10px 15px', borderRadius: '8px', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '5px' }}>ROOM DETAILS</div>
                          <div style={{ fontSize: '0.9rem' }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'white' }}>{reg.tournament.roomId}</span></div>
                          <div style={{ fontSize: '0.9rem' }}>Pass: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'white' }}>{reg.tournament.roomPassword}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Match Results Section */}
          <div>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>My Match Results</h3>
            {matchResults.length === 0 ? (
              <div style={{ background: 'var(--bg-charcoal)', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-muted">No match results published for your team yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'var(--bg-charcoal)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '15px' }}>Tournament</th>
                      <th style={{ padding: '15px' }}>Kills</th>
                      <th style={{ padding: '15px' }}>Placement</th>
                      <th style={{ padding: '15px', color: 'var(--accent-orange)' }}>Total Score</th>
                      <th style={{ padding: '15px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResults.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: r.isQualified ? 'rgba(0, 204, 102, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{r.tournament.title}</td>
                        <td style={{ padding: '15px' }}>{r.kills}</td>
                        <td style={{ padding: '15px' }}>#{r.placement}</td>
                        <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{r.totalScore}</td>
                        <td style={{ padding: '15px' }}>
                          {r.isQualified ? (
                            <span style={{ 
                              padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                              background: '#00cc66', color: '#000', boxShadow: '0 0 10px rgba(0,204,102,0.3)'
                            }}>
                              ✅ QF QUALIFIED
                            </span>
                          ) : (
                            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Eliminated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
