import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, doc } from '../../utils/firebase';
import AdminDonorMatching from './AdminDonorMatching';
import { validateEmail, validatePhone, isNonEmpty } from '../../utils/validationUtils';
import { Hospital, Mail, ShieldAlert, Copy, Check, Users, Send, LayoutDashboard, Plus, MapPin, Phone } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitals, setHospitals] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedEmergencyReq, setSelectedEmergencyReq] = useState(null);
  const [invForm, setInvForm] = useState({ hospitalName: '', email: '', phone: '', city: '' });
  const [shareLink, setShareLink] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [inviteErrors, setInviteErrors] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => { loadAdminData(); }, []);

  async function loadAdminData() {
    const hSnap = await getDocs(collection(db, 'hospitals'));
    setHospitals(hSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const invSnap = await getDocs(collection(db, 'hospitalInvitations'));
    setInvitations(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const emSnap = await getDocs(collection(db, 'emergencyRequests'));
    setEmergencyRequests(emSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  const handleSendInvite = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!isNonEmpty(invForm.hospitalName)) nextErrors.hospitalName = 'Hospital name is required.';
    if (!validateEmail(invForm.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!validatePhone(invForm.phone)) nextErrors.phone = 'Please enter a valid phone number.';
    if (!isNonEmpty(invForm.city)) nextErrors.city = 'City is required.';
    setInviteErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const token = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'hospitalInvitations'), {
      ...invForm, token, status: 'Pending', createdAt: new Date().toISOString()
    });

    const generatedLink = `${window.location.origin}/register-hospital?token=${token}`;
    setShareLink(generatedLink);
    setShareToken(token);
    setInvForm({ hospitalName: '', email: '', phone: '', city: '' });
    loadAdminData();
  };

  const copyToClipboard = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    } catch (err) {
      alert('Copy failed. Please copy manually.');
    }
  };

  const handleApproveHosp = async (id) => {
    await updateDoc(doc(db, 'hospitals', id), { status: 'Approved' });
    alert('Hospital Approved!');
    loadAdminData();
  };

  return (
    <div className="page-shell">
      <div style={{ marginBottom: '28px' }}>
        <div className="section-label">
          <LayoutDashboard size={14} /> Control Hub
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>
          Admin Management Center
        </h1>
      </div>

      {/* Tab Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'hospitals', label: 'Hospitals', icon: Hospital },
          { id: 'invitations', label: 'Invitations', icon: Mail },
          { id: 'emergency', label: 'Emergency Requests', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#0F172A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#64748B',
                border: `1.5px solid ${isActive ? '#0F172A' : '#CBD5E1'}`,
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#E0F2FE', padding: '16px', borderRadius: '16px', color: '#0369A1' }}>
              <Hospital size={30} />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>{hospitals.length}</div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Registered Hospitals</div>
            </div>
          </div>

          <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '16px', color: '#B45309' }}>
              <Mail size={30} />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>{invitations.filter(i => i.status === 'Pending').length}</div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Pending Invitations</div>
            </div>
          </div>

          <div className="card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#FFE4E6', padding: '16px', borderRadius: '16px', color: '#BE123C' }}>
              <ShieldAlert size={30} />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>{emergencyRequests.length}</div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Active Emergency Requests</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOSPITALS */}
      {activeTab === 'hospitals' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>Registered Hospital Network</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.city}</td>
                    <td>
                      <span className={`badge ${h.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>
                      {h.status === 'Pending' && (
                        <button onClick={() => handleApproveHosp(h.id)} className="secondary-btn" style={{ fontSize: '12px', padding: '6px 12px' }}>
                          Approve Registration
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#E30613" /> Invite New Hospital Partner
            </h3>
            <form onSubmit={handleSendInvite}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Hospital Name</label>
                <input type="text" value={invForm.hospitalName} onChange={e => { setInvForm({ ...invForm, hospitalName: e.target.value }); setInviteErrors({ ...inviteErrors, hospitalName: '' }); }} required />
                {inviteErrors.hospitalName && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{inviteErrors.hospitalName}</div>}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Official Email</label>
                <input type="email" value={invForm.email} onChange={e => { setInvForm({ ...invForm, email: e.target.value }); setInviteErrors({ ...inviteErrors, email: '' }); }} required />
                {inviteErrors.email && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{inviteErrors.email}</div>}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Phone Number</label>
                <input type="text" value={invForm.phone} onChange={e => { setInvForm({ ...invForm, phone: e.target.value }); setInviteErrors({ ...inviteErrors, phone: '' }); }} required />
                {inviteErrors.phone && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{inviteErrors.phone}</div>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>City / Location</label>
                <input type="text" value={invForm.city} onChange={e => { setInvForm({ ...invForm, city: e.target.value }); setInviteErrors({ ...inviteErrors, city: '' }); }} required />
                {inviteErrors.city && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{inviteErrors.city}</div>}
              </div>

              <button type="submit" className="primary-btn" style={{ width: '100%', padding: '12px' }}>
                <Send size={16} /> Generate & Send Invitation Token
              </button>
            </form>
          </div>

          {shareLink && (
            <div className="card" style={{ padding: '28px', background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', alignSelf: 'start' }}>
              <h4 style={{ margin: '0 0 12px', color: '#0F172A', fontSize: '16px' }}>Generated Registration Token</h4>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Invitation Token</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#E30613', letterSpacing: '0.05em' }}>{shareToken}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px', wordBreak: 'break-all' }}>{shareLink}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => copyToClipboard(shareLink, 'link')} className="primary-btn" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />} {copiedLink ? 'Link Copied' : 'Copy Link'}
                </button>
                <button onClick={() => copyToClipboard(shareToken, 'token')} className="secondary-btn" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  {copiedToken ? <Check size={16} /> : <Copy size={16} />} {copiedToken ? 'Token Copied' : 'Copy Token'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EMERGENCY REQUESTS */}
      {activeTab === 'emergency' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>Active Emergency Requests Queue</h3>
          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units Required</th>
                  <th>Urgency Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {emergencyRequests.map(er => (
                  <tr key={er.id}>
                    <td>
                      <span className="badge badge-danger" style={{ fontSize: '14px', fontWeight: '800' }}>{er.bloodGroup}</span>
                    </td>
                    <td><strong>{er.unitsRequired} Pints</strong></td>
                    <td>
                      <span className={`badge ${er.urgency === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {er.urgency}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedEmergencyReq(er)} className="emergency-btn" style={{ fontSize: '12px', padding: '6px 14px' }}>
                        FIND DONORS NOW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedEmergencyReq && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
              <AdminDonorMatching emergencyRequest={selectedEmergencyReq} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
