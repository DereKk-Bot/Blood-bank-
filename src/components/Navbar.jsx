import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Droplet, Heart, ShieldAlert, Bell, User, LogOut, Search, Activity, Hospital, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 40%, #881337 100%)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #E30613 0%, #BE123C 100%)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(227, 6, 19, 0.5)'
          }}>
            <Droplet size={22} color="#ffffff" fill="#ffffff" className="animate-float" />
          </div>
          <div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Blood<span style={{ color: '#F43F5E' }}>Connect</span>
            </span>
            <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.1em', uppercase: true }}>
              EMERGENCY NETWORK
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/compatibility" className={`nav-link ${isActive('/compatibility') ? 'active' : ''}`}>
            <Activity size={16} /> Compatibility
          </Link>
          <Link to="/find-blood" className={`nav-link ${isActive('/find-blood') ? 'active' : ''}`}>
            <Search size={16} /> Find Blood
          </Link>
          <Link to="/donor-intro" className={`nav-link ${isActive('/donor-intro') ? 'active' : ''}`}>
            <Heart size={16} /> Donate
          </Link>
          <Link to="/emergency-request" style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)',
            transition: 'transform 0.2s'
          }}>
            <ShieldAlert size={16} /> Emergency
          </Link>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
              {userProfile?.role === 'ADMIN' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              {userProfile?.role === 'HOSPITAL' && (
                <Link to="/hospital" className={`nav-link ${isActive('/hospital') ? 'active' : ''}`}>
                  <Hospital size={16} /> Hospital
                </Link>
              )}
              {userProfile?.role === 'DONOR' && (
                <Link to="/donor" className={`nav-link ${isActive('/donor') ? 'active' : ''}`}>
                  <User size={16} /> Dashboard
                </Link>
              )}
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                Profile
              </Link>

              {/* Notification Pill */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Bell size={14} color="#F43F5E" />
                <span>Alerts</span>
                <span style={{
                  background: unreadCount > 0 ? '#E30613' : '#64748B',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '9999px'
                }}>
                  {unreadCount}
                </span>
              </div>

              <button onClick={handleLogout} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
              <Link to="/login" style={{
                color: '#FFF',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                background: 'rgba(255,255,255,0.1)'
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                background: '#E30613',
                color: '#FFF',
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(227,6,19,0.3)'
              }}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
