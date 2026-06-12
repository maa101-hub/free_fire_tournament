"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TournamentsDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'solo',
    entryFee: 0,
    prizePool: 0,
    totalSlots: 50,
    scheduledDate: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/admin/tournaments');
      const data = await res.json();
      if (data.success) {
        setTournaments(data.tournaments);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Tournament created successfully!');
        setFormData({ title: '', type: 'solo', entryFee: 0, prizePool: 0, totalSlots: 50, scheduledDate: '' });
        fetchTournaments();
      } else {
        alert(data.error || 'Failed to create tournament');
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-white)', padding: '40px 20px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>Manage Tournaments</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/admin" className="btn btn-secondary btn-sm">← Back to Dashboard</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' }}>
          {/* Create Tournament Form */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '20px' }}>Create New Tournament</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Tournament Title</label>
                <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Weekly Solo Cash Cup" />
              </div>
              <div className="form-group">
                <label className="form-label">Format Type</label>
                <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="squad">Squad</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Entry Fee (₹)</label>
                  <input type="number" className="form-control" required min="0" value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prize Pool (₹)</label>
                  <input type="number" className="form-control" required min="0" value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Total Slots</label>
                  <input type="number" className="form-control" required min="2" value={formData.totalSlots} onChange={e => setFormData({...formData, totalSlots: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input type="datetime-local" className="form-control" required value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Tournament'}
              </button>
            </form>
          </div>

          {/* Tournaments List */}
          <div style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '20px' }}>All Tournaments</h3>
            {loading ? (
              <p>Loading tournaments...</p>
            ) : tournaments.length === 0 ? (
              <p className="text-muted">No tournaments created yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px' }}>Title</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Fee/Prize</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Room Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.title}</td>
                        <td style={{ padding: '12px', textTransform: 'uppercase' }}>{t.type}</td>
                        <td style={{ padding: '12px' }}>₹{t.entryFee} / ₹{t.prizePool}</td>
                        <td style={{ padding: '12px' }}>{new Date(t.scheduledDate).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                            background: t.status === 'OPEN' ? 'rgba(0,200,100,0.1)' : 'rgba(255,255,255,0.1)',
                            color: t.status === 'OPEN' ? '#00cc66' : '#aaa'
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const roomId = e.target.roomId.value;
                            const roomPassword = e.target.roomPassword.value;
                            try {
                              const res = await fetch('/api/admin/tournaments', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: t.id, roomId, roomPassword })
                              });
                              if (res.ok) alert('Room details updated!');
                            } catch (e) {}
                          }} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <input name="roomId" defaultValue={t.roomId || ''} placeholder="Room ID" className="form-control" style={{ padding: '5px', fontSize: '0.8rem', width: '80px' }} />
                            <input name="roomPassword" defaultValue={t.roomPassword || ''} placeholder="Password" className="form-control" style={{ padding: '5px', fontSize: '0.8rem', width: '80px' }} />
                            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Save</button>
                          </form>
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
