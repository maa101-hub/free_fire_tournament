"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // For modal

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
      console.error('Failed to fetch registrations:', error);
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
        fetchRegistrations(); // Refresh list
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Registrations...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '10px' }}>Registration Approvals</h1>
          <p className="text-muted">Verify UPI screenshots and approve players</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">← Back to Admin</Link>
      </div>

      <div className="card" style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Tournament</th>
              <th style={{ padding: '15px' }}>Team/Player</th>
              <th style={{ padding: '15px' }}>Contact</th>
              <th style={{ padding: '15px' }}>Payment Proof</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No registrations found</td></tr>
            ) : registrations.map(reg => (
              <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>{reg.tournament?.title}</td>
                <td style={{ padding: '15px' }}>
                  <strong>{reg.teamName || reg.captainName}</strong><br/>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>UID: {reg.uid} ({reg.type})</span>
                </td>
                <td style={{ padding: '15px' }}>{reg.phone}</td>
                <td style={{ padding: '15px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedImage(reg.paymentProofUrl)}
                  >
                    View Image
                  </button>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.8rem',
                    background: reg.status === 'PENDING' ? 'rgba(255,165,0,0.2)' : reg.status === 'APPROVED' ? 'rgba(0,200,100,0.2)' : 'rgba(255,0,0,0.2)',
                    color: reg.status === 'PENDING' ? '#ffa500' : reg.status === 'APPROVED' ? '#00cc66' : '#ff3333'
                  }}>
                    {reg.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  {reg.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => updateStatus(reg.id, 'APPROVED')} className="btn btn-primary btn-sm" style={{ background: '#00cc66', border: 'none' }}>Approve</button>
                      <button onClick={() => updateStatus(reg.id, 'REJECTED')} className="btn btn-secondary btn-sm" style={{ background: '#ff3333', border: 'none', color: 'white' }}>Reject</button>
                    </div>
                  )}
                  {reg.status !== 'PENDING' && (
                    <span className="text-muted">No actions needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.9)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <button 
            style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
          <img 
            src={selectedImage} 
            alt="Payment Proof" 
            style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', border: '2px solid var(--accent-orange)' }} 
          />
          <p style={{ marginTop: '20px', color: 'white' }}>Click anywhere to close</p>
        </div>
      )}
    </div>
  );
}
