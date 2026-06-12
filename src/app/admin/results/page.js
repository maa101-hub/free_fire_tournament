"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminResultsEntry() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Score Data Map: uid -> { kills, placement }
  const [scoreData, setScoreData] = useState({});

  useEffect(() => {
    // Fetch all open tournaments to choose from
    fetch('/api/admin/tournaments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTournaments(data.tournaments.filter(t => t.status !== 'CLOSED'));
        }
        setLoading(false);
      });
  }, []);

  // When a tournament is selected, fetch its APPROVED registrations
  useEffect(() => {
    if (selectedTournament) {
      setLoading(true);
      fetch('/api/admin/registrations')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const approved = data.registrations.filter(r => 
              r.tournamentId === selectedTournament && r.status === 'APPROVED'
            );
            setRegistrations(approved);
            
            // Initialize score data
            const initialScores = {};
            approved.forEach(reg => {
              initialScores[reg.uid] = { kills: 0, placement: 0 };
            });
            setScoreData(initialScores);
          }
          setLoading(false);
        });
    }
  }, [selectedTournament]);

  const handleScoreChange = (uid, field, value) => {
    setScoreData(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const publishResults = async () => {
    if (!confirm("Are you sure you want to publish these results? This will mark the top 8 as QUALIFIED and close the tournament.")) return;
    
    setIsSubmitting(true);
    const resultsPayload = registrations.map(reg => ({
      uid: reg.uid,
      teamName: reg.teamName || reg.captainName,
      kills: scoreData[reg.uid]?.kills || 0,
      placement: scoreData[reg.uid]?.placement || 0
    }));

    try {
      const res = await fetch('/api/admin/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: selectedTournament,
          results: resultsPayload
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Results published successfully!");
        router.push('/admin');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error publishing results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && tournaments.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '10px' }}>Enter Match Results</h1>
          <p className="text-muted">Enter kills and placements. System auto-calculates total scores and Top 8 Qualification.</p>
        </div>
        <Link href="/admin" className="btn btn-secondary">← Back to Admin</Link>
      </div>

      <div className="card" style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <label className="form-label">Select Tournament to Score</label>
        <select 
          className="form-control" 
          value={selectedTournament} 
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">-- Choose Tournament --</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.title} ({t.type.toUpperCase()}) - {new Date(t.scheduledDate).toLocaleDateString()}</option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <div className="card" style={{ background: 'var(--bg-charcoal)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Approved Teams ({registrations.length})</h3>
            <button 
              className="btn btn-primary" 
              style={{ background: '#00cc66', borderColor: '#00cc66' }}
              onClick={publishResults}
              disabled={isSubmitting || registrations.length === 0}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Results & Leaderboard'}
            </button>
          </div>

          {registrations.length === 0 ? (
            <p className="text-muted">No approved registrations found for this tournament.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '15px' }}>Team / Player</th>
                  <th style={{ padding: '15px' }}>UID</th>
                  <th style={{ padding: '15px' }}>Kills (1 pt each)</th>
                  <th style={{ padding: '15px' }}>Placement (1 = 12 pts)</th>
                  <th style={{ padding: '15px' }}>Auto Score</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => {
                  const s = scoreData[reg.uid] || { kills: 0, placement: 0 };
                  const placementScore = s.placement === 1 ? 12 : 0;
                  const totalScore = s.kills + placementScore;

                  return (
                    <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{reg.teamName || reg.captainName}</td>
                      <td style={{ padding: '15px', fontFamily: 'monospace' }}>{reg.uid}</td>
                      <td style={{ padding: '15px' }}>
                        <input 
                          type="number" 
                          min="0"
                          className="form-control" 
                          style={{ width: '80px', padding: '8px' }}
                          value={s.kills === 0 ? '' : s.kills}
                          onChange={(e) => handleScoreChange(reg.uid, 'kills', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ padding: '15px' }}>
                        <input 
                          type="number" 
                          min="0"
                          className="form-control" 
                          style={{ width: '80px', padding: '8px' }}
                          value={s.placement === 0 ? '' : s.placement}
                          onChange={(e) => handleScoreChange(reg.uid, 'placement', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                        {totalScore}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
