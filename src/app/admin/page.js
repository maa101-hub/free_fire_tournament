"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/admin/registrations');
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-white)', padding: '40px 20px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/admin/registrations" className="btn btn-primary btn-sm" style={{background: '#00cc66', borderColor: '#00cc66'}}>View Approvals</Link>
            <Link href="/admin/tournaments" className="btn btn-primary btn-sm">Manage Tournaments</Link>
            <Link href="/admin/results" className="btn btn-primary btn-sm" style={{background: 'var(--accent-orange)', boxShadow: '0 4px 15px rgba(255,102,0,0.3)'}}>Match Results</Link>
            <Link href="/" className="btn btn-secondary btn-sm">View Site</Link>
          </div>
        </div>

        <div style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Pending Registrations</h2>
          
          {loading ? (
            <p>Loading registrations...</p>
          ) : registrations.length === 0 ? (
            <p className="text-muted">No registrations found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Player/Team</th>
                    <th style={{ padding: '12px' }}>UID</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Payment</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        {reg.captainName} {reg.teamName && <span style={{color: 'var(--text-muted)'}}>({reg.teamName})</span>}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{reg.uid}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: reg.type === 'solo' ? 'rgba(0,200,255,0.1)' : 'rgba(255,102,0,0.1)',
                          color: reg.type === 'solo' ? 'var(--accent-blue)' : 'var(--accent-orange)'
                        }}>
                          {reg.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {reg.paymentProofUrl && reg.paymentProofUrl !== 'pending-upload' ? (
                          <a href={reg.paymentProofUrl} target="_blank" rel="noreferrer" style={{color: 'var(--accent-blue)', textDecoration: 'underline'}}>View Image</a>
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: reg.status === 'PENDING' ? 'rgba(255,200,0,0.1)' : reg.status === 'APPROVED' ? 'rgba(0,200,100,0.1)' : 'rgba(255,0,0,0.1)',
                          color: reg.status === 'PENDING' ? '#ffcc00' : reg.status === 'APPROVED' ? '#00cc66' : '#ff4444'
                        }}>
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ padding: '6px 12px', background: '#00cc66', borderColor: '#00cc66' }}
                          onClick={() => updateStatus(reg.id, 'APPROVED')}
                          disabled={reg.status === 'APPROVED'}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => updateStatus(reg.id, 'REJECTED')}
                          disabled={reg.status === 'REJECTED'}
                        >
                          Reject
                        </button>
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
  );
}
