import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Phone, ShieldCheck, Activity, Heart, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
      color: '#94A3B8',
      padding: '48px 24px 24px',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Column 1: Brand & Slogan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #E30613 0%, #BE123C 100%)',
                padding: '6px',
                borderRadius: '10px'
              }}>
                <Droplet size={20} color="#FFFFFF" fill="#FFFFFF" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                Blood<span style={{ color: '#F43F5E' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94A3B8', marginBottom: '20px' }}>
              Rapid emergency blood matching network connecting donors, recipients, and hospitals with verified real-time inventory tracking.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#22C55E', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' }}></span>
              <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '600' }}>
                Emergency Dispatch Systems Operational
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><Link to="/find-blood" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Find Compatible Blood</Link></li>
              <li><Link to="/compatibility" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Blood Type Matrix</Link></li>
              <li><Link to="/donor-intro" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Become a Registered Donor</Link></li>
              <li><Link to="/emergency-request" style={{ color: '#F43F5E', textDecoration: 'none', fontWeight: '700' }}>Submit Emergency Request</Link></li>
            </ul>
          </div>

          {/* Column 3: Medical Network */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.02em' }}>
              For Hospitals & Admins
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Hospital Partner Portal</Link></li>
              <li><Link to="/register-hospital" style={{ color: '#94A3B8', textDecoration: 'none' }}>Redeem Hospital Invitation</Link></li>
              <li><Link to="/admin" style={{ color: '#94A3B8', textDecoration: 'none' }}>Admin Control Center</Link></li>
            </ul>
          </div>

          {/* Column 4: Emergency Hotline */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.02em' }}>
              24/7 Emergency Dispatch
            </h4>
            <div style={{
              background: 'rgba(227, 6, 19, 0.12)',
              border: '1px solid rgba(227, 6, 19, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{ background: '#E30613', padding: '10px', borderRadius: '12px' }}>
                <Phone size={22} color="#FFFFFF" />
              </div>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FCA5A5', fontWeight: '700' }}>
                  Hotline Ticker
                </span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>
                  1-800-BLOOD-HELP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div>
            BloodConnect Emergency Response Network © 2026. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#22C55E" /> Verified Medical Standards
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
