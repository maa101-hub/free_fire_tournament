"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '../register.css';

function RegisterForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const [step, setStep] = useState(1);
  const [tournament, setTournament] = useState(null);
  const [formData, setFormData] = useState({
    teamName: '',
    captainName: '',
    uid: '',
    phone: '',
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      if (tournamentId) {
        router.push(`/signup?redirect=/register?tournamentId=${tournamentId}`);
      } else {
        router.push('/signup');
      }
    }
  }, [status, router, tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      fetch('/api/tournaments')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const found = data.tournaments.find(t => t.id === tournamentId);
            if (found) {
              setTournament(found);
            }
          }
        });
    }
  }, [tournamentId]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 2));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const submitRegistration = async () => {
    if (!file) {
      alert("Please upload a payment screenshot");
      return;
    }
    if (!tournament) {
      alert("No tournament selected. Please go back and select a tournament.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload File
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const uploadJson = await uploadRes.json();
      
      if (!uploadJson.success) {
        alert(uploadJson.error || 'File upload failed');
        setIsSubmitting(false);
        return;
      }

      // 2. Submit Registration
      const payload = { ...formData, type: tournament.type, paymentProofUrl: uploadJson.url, tournamentId };
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Registration submitted successfully! You can track your status in the dashboard.');
        window.location.href = '/';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!tournamentId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'var(--bg-dark)', color: 'white' }}>
        <h2>No Tournament Selected</h2>
        <Link href="/#tournaments" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Tournaments</Link>
      </div>
    );
  }

  if (!tournament) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white' }}>Loading Tournament Details...</div>;
  }

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
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Register for {tournament.title}</h1>
            <p className="text-muted" style={{ textTransform: 'capitalize' }}>{tournament.type} Battle • Entry Fee: ₹{tournament.entryFee}</p>
          </div>

          <div className="progress-container">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          {/* Step 1: Player Details */}
          <div className={`form-section ${step === 1 ? 'active' : ''}`}>
            <h3 style={{marginBottom: '20px'}}>Player Details</h3>
            {tournament.type !== 'solo' && (
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="teamName"
                  placeholder="Enter your team name"
                  value={formData.teamName}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{tournament.type === 'solo' ? 'Player Name' : 'Captain Name'}</label>
              <input 
                type="text" 
                className="form-control" 
                name="captainName"
                placeholder="In-game name"
                value={formData.captainName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{tournament.type === 'solo' ? 'Free Fire UID' : 'Captain Free Fire UID'}</label>
              <input 
                type="text" 
                className="form-control" 
                name="uid"
                placeholder="e.g. 1234567890"
                value={formData.uid}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input 
                type="tel" 
                className="form-control" 
                name="phone"
                placeholder="For any contact"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Step 2: Payment Proof */}
          <div className={`form-section ${step === 2 ? 'active' : ''}`}>
            <h3 style={{marginBottom: '20px'}}>Payment Verification</h3>
            
            <div className="qr-section">
              <p style={{marginBottom: '16px'}}>Scan the QR code below to pay the entry fee using any UPI app (GPay, PhonePe, Paytm).</p>
              <div className="qr-placeholder">
                [YOUR UPI QR CODE HERE]
              </div>
              <p className="text-muted" style={{fontSize: '0.85rem'}}>Amount to pay: <strong>₹{tournament.entryFee}</strong></p>
            </div>

            <div className="upload-zone">
              <div className="upload-icon">📸</div>
              <h4>Upload Payment Screenshot</h4>
              <p className="text-muted" style={{fontSize: '0.85rem', marginTop: '8px'}}>Click to browse or drag and drop image here</p>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{marginTop: '15px'}} />
              {file && <p style={{marginTop: '10px', color: '#00cc66'}}>Selected: {file.name}</p>}
            </div>
          </div>

          <div className="form-actions">
            {step > 1 ? (
              <button className="btn btn-secondary" onClick={prevStep}>Back</button>
            ) : <div></div>}
            
            {step < 2 ? (
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{boxShadow: '0 4px 20px rgba(0, 200, 100, 0.4)', background: '#00c864'}}
                onClick={submitRegistration}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
