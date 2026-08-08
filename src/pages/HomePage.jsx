import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs, query, where } from '../utils/firebase';
import { Droplet, Heart, ShieldAlert, Activity, Clock, Hospital, Users, CheckCircle2, ArrowRight, Zap, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    inventoryCount: 0,
    donorCount: 0,
    hospitalCount: 0,
    emergencyCount: 0
  });
  const [activeEmergency, setActiveEmergency] = useState(null);

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const invSnap = await getDocs(collection(db, 'bloodInventory'));
        const inventoryCount = invSnap.size;

        const donorQuery = query(collection(db, 'users'), where('role', '==', 'DONOR'));
        const donorSnap = await getDocs(donorQuery);
        const donorCount = donorSnap.size;

        const hospSnap = await getDocs(collection(db, 'hospitals'));
        const hospitalCount = hospSnap.size;

        const emSnap = await getDocs(collection(db, 'emergencyRequests'));
        const emergencyCount = emSnap.size;

        const pendingEm = emSnap.docs.map(d => ({ id: d.id, ...d.data() })).find(req => req.status === 'PENDING');
        if (pendingEm) {
          setActiveEmergency(pendingEm);
        }

        setStats({
          inventoryCount,
          donorCount,
          hospitalCount,
          emergencyCount
        });
      } catch (err) {
        console.error("Unable to load live metrics:", err);
      }
    }
    fetchLiveStats();
  }, []);

  return (
    <div className="page-shell">
      {/* Emergency Live Alert Ticker */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '16px',
        padding: '12px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-dot"></span>
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Network Status
          </span>
          <span style={{ color: '#475569', fontSize: '14px' }}>
            {activeEmergency ? (
              <>Urgent emergency request active: <strong>{activeEmergency.bloodGroup}</strong> ({activeEmergency.unitsRequired} units needed)</>
            ) : (
              <>BloodConnect dispatch system operational across active regional blood banks.</>
            )}
          </span>
        </div>
        <Link to="/emergency-request" style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#DC2626',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          Emergency Request <ArrowRight size={14} />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #881337 100%)',
        color: '#FFFFFF',
        padding: '54px 44px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(136, 19, 55, 0.4)',
        marginBottom: '32px'
      }}>
        {/* Decorative Background Droplet Glow */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          bottom: '-40px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(227,6,19,0.3) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxContentWidth: '780px', position: 'relative', zIndex: 10 }}>
          <div className="section-label" style={{ background: 'rgba(254, 205, 211, 0.15)', color: '#FECDD3', border: '1px solid rgba(254, 205, 211, 0.3)' }}>
            <Zap size={14} color="#F43F5E" /> Rapid Emergency Network
          </div>
          <h1 className="hero-title" style={{ margin: '16px 0 16px', color: '#FFFFFF' }}>
            Every Drop Can <span style={{ background: 'linear-gradient(90deg, #F43F5E 0%, #FB7185 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Save a Life</span>
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: '18px', color: '#E2E8F0', maxWidth: '700px', lineHeight: 1.6 }}>
            Connecting blood donors, hospital inventory systems, and emergency recipients instantly. Built for critical trauma response, automated donor matching, and live stock tracking.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/donor-intro">
              <button className="primary-btn" style={{ padding: '14px 28px', fontSize: '15px' }}>
                <Heart size={18} fill="#ffffff" /> Donate Blood Now
              </button>
            </Link>
            <Link to="/emergency-request">
              <button className="emergency-btn" style={{ padding: '14px 28px', fontSize: '15px' }}>
                <ShieldAlert size={18} /> Request Emergency Supply
              </button>
            </Link>
            <Link to="/login">
              <button className="secondary-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 24px', fontSize: '15px' }}>
                <Hospital size={18} /> Hospital Portal
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Database Metrics Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#FFE4E6', padding: '14px', borderRadius: '16px', color: '#BE123C' }}>
            <Droplet size={28} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>{stats.inventoryCount}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Blood Units</div>
          </div>
        </div>

        <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#DCFCE7', padding: '14px', borderRadius: '16px', color: '#15803D' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>{stats.donorCount}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Registered Donors</div>
          </div>
        </div>

        <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#E0F2FE', padding: '14px', borderRadius: '16px', color: '#0369A1' }}>
            <Hospital size={28} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>{stats.hospitalCount}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Partner Hospitals</div>
          </div>
        </div>

        <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '16px', color: '#B45309' }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>{stats.emergencyCount}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Emergency Requests</div>
          </div>
        </div>
      </div>

      {/* How It Works & Importance Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <div className="section-label">
            <Sparkles size={14} /> Workflow Overview
          </div>
          <h2 style={{ marginTop: '8px', marginBottom: '20px', color: '#0F172A', fontSize: '22px' }}>
            How BloodConnect Operates
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E30613', color: '#FFF', fontWeight: '800', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>1</div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A' }}>Instant Emergency Request</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Patients or hospitals log emergency requirements with blood group and unit quantities.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E30613', color: '#FFF', fontWeight: '800', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>2</div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A' }}>Smart Donor Compatibility Matching</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>System instantly identifies compatible donor types and alerts registered local donors via SMS & push notifications.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E30613', color: '#FFF', fontWeight: '800', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>3</div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A' }}>Transfusion & Inventory Dispatch</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Hospitals manage blood bag units, crossmatch testing, and track expiration statuses in real time.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)' }}>
          <div className="section-label" style={{ background: '#FFE4E6', color: '#BE123C' }}>
            <Activity size={14} /> Medical Facts
          </div>
          <h2 style={{ marginTop: '8px', marginBottom: '16px', color: '#0F172A', fontSize: '22px' }}>
            Why Voluntary Donation Matters
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: '#334155' }}>
              <CheckCircle2 size={18} color="#E30613" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Non-Synthesizable:</strong> Blood cannot be artificially manufactured. Human donation is the sole source for life-saving transfusions.</div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: '#334155' }}>
              <CheckCircle2 size={18} color="#E30613" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Trauma Care:</strong> A single severe car accident victim can require up to 100 pints of blood in trauma surgery.</div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: '#334155' }}>
              <CheckCircle2 size={18} color="#E30613" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Shelf Life Limits:</strong> Red blood cells must be used within 42 days of donation, requiring continuous active replenishment.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
