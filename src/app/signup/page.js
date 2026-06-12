"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Automatically log them in after sign up
      const signInRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      router.push(redirectUrl);
      router.refresh();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neon-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔥</div>
      <h2 style={{ marginBottom: '10px' }}>Create Account</h2>
      <p className="text-muted" style={{ marginBottom: '30px' }}>Join the Arena and track your stats</p>
      
      {error && (
        <div style={{ background: 'rgba(255, 45, 45, 0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Player Name</label>
          <input 
            type="text" 
            className="form-control"
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-control"
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
        </div>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control"
            required 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
        </button>
      </form>

      <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Already have an account?</p>
        <Link href={`/login${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>Login to Dashboard</Link>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(/assets/hero-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px'
    }}>
      <Suspense fallback={<div style={{ color: 'white' }}>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
