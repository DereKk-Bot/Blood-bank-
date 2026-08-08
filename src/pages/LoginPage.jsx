import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, isNonEmpty } from '../utils/validationUtils';
import { Mail, Lock, LogIn, Droplet, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const nextErrors = {};
    if (!validateEmail(email)) nextErrors.email = 'Please enter a valid email address.';
    if (!isNonEmpty(password)) nextErrors.password = 'Password is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError("Login failed. Check your email and password.");
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '48px auto 64px', padding: '0 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #E30613 0%, #BE123C 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 6px 16px rgba(227, 6, 19, 0.3)'
          }}>
            <Droplet size={26} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <h2 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '24px', fontWeight: '800' }}>
            Welcome Back
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            Sign in to access donor, hospital, and emergency dispatch tools securely.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FFE4E6',
            border: '1px solid #FECDD3',
            color: '#BE123C',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: '' }); }}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
            {fieldErrors.email && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{fieldErrors.email}</div>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: '' }); }}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
            {fieldErrors.password && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{fieldErrors.password}</div>}
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#E30613', fontWeight: '700', textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
