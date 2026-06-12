"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-card" style={{ 
      maxWidth: '420px', 
      width: '90%', 
      position: 'relative', 
      zIndex: 1,
      background: 'rgba(20, 20, 25, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 102, 0, 0.1)',
      padding: '40px',
      borderRadius: '16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div className="logo-icon" style={{ fontSize: '3.5rem', marginBottom: '15px', textShadow: '0 0 20px rgba(255, 102, 0, 0.5)' }}>🔥</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Player & Admin Login</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Enter your credentials to access the dashboard</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', width: '100%' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', width: '100%' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ 
          width: '100%', 
          padding: '14px', 
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)'
        }}>
          {loading ? 'Logging In...' : 'Login to Dashboard'}
        </button>
      </form>
      
      <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0' }}>Don't have an account?</p>
        <Link href={`/signup${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>Create Player Account</Link>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px' }}>← Return to Arena</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(/assets/hero-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-orange)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.2', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'var(--accent-blue)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.2', zIndex: 0 }}></div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
