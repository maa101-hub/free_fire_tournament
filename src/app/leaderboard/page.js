"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchLeaderboard(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      if (data.success) {
        setTournaments(data.tournaments);
        if (data.tournaments.length > 0) {
          setSelectedTournament(data.tournaments[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (tournamentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?tournamentId=${tournamentId}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar scrolled">
        <div className="container">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">🔥</div>
            <span>FF ARENA</span>
          </Link>
          <div className="nav-links">
            <Link href="/#tournaments">Tournaments</Link>
            <Link href="/dashboard">Track Status</Link>
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </nav>

      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(/assets/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '120px 20px 60px',
        color: 'white'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '15px' }}>
              <span className="gradient-text">Global</span> Leaderboard
            </h1>
            <p className="text-muted" style={{ marginBottom: '30px' }}>
              Top 8 teams automatically qualify for the Quarter Finals!
            </p>
            
            {tournaments.length > 0 && (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="form-group">
                  <select 
                    className="form-control" 
                    value={selectedTournament} 
                    onChange={e => setSelectedTournament(e.target.value)}
                    style={{ background: 'rgba(20, 20, 25, 0.8)', textAlign: 'center' }}
                  >
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(20, 20, 25, 0.6)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading Leaderboard...</p>
            ) : results.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center' }}>No match results published for this tournament yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '15px' }}>Rank</th>
                      <th style={{ padding: '15px' }}>Player/Team</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Kills</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Placement</th>
                      <th style={{ padding: '15px', textAlign: 'center', color: 'var(--accent-orange)' }}>Score</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, index) => {
                      const rank = index + 1;
                      const isQualified = rank <= 8;
                      
                      let rankBadge = `#${rank}`;
                      if (rank === 1) rankBadge = '🥇 1st';
                      if (rank === 2) rankBadge = '🥈 2nd';
                      if (rank === 3) rankBadge = '🥉 3rd';

                      return (
                        <tr key={r.id} style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isQualified ? 'rgba(0, 204, 102, 0.05)' : 'transparent',
                          transition: 'background 0.3s'
                        }}>
                          <td style={{ padding: '15px', fontWeight: 'bold', fontSize: rank <= 3 ? '1.1rem' : '1rem' }}>{rankBadge}</td>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{r.teamName}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>{r.kills}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>#{r.placement}</td>
                          <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{r.totalScore}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            {isQualified ? (
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold',
                                background: '#00cc66', 
                                color: '#000',
                                boxShadow: '0 0 10px rgba(0,204,102,0.3)'
                              }}>
                                QUALIFIED
                              </span>
                            ) : (
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem', 
                                background: 'rgba(255,255,255,0.1)', 
                                color: '#aaa'
                              }}>
                                ELIMINATED
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
