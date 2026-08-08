import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs, doc, setDoc, updateDoc, createUserWithEmailAndPassword, auth } from '../utils/firebase';
import { validatePassword } from '../utils/validationUtils';
import { Hospital, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterHospitalPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) { setLoading(false); return; }
      try {
        const q = query(collection(db, 'hospitalInvitations'), where('token', '==', token), where('status', '==', 'Pending'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setInvitation({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        const message = err?.message || 'Unable to verify invitation.';
        setError(message.includes('blocked by client') || message.includes('ERR_BLOCKED_BY_CLIENT')
          ? 'This browser is blocking Firestore requests. Please allow firestore.googleapis.com or disable an ad blocker for this site and try again.'
          : message);
      }
      setLoading(false);
    }
    verifyToken();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, invitation.email, password);
      const uid = res.user.uid;

      await setDoc(doc(db, 'users', uid), {
        userId: uid, name: invitation.hospitalName, email: invitation.email,
        phone: invitation.phone, role: 'HOSPITAL', city: invitation.city || '', createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'hospitals', uid), {
        hospitalId: uid, name: invitation.hospitalName, email: invitation.email,
        phone: invitation.phone, city: invitation.city || '', status: 'Pending', createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'hospitalInvitations', invitation.id), { status: 'Accepted' });
      alert('Hospital account registered! Awaiting admin approval.');
      navigate('/login');
    } catch (err) {
      const message = err?.message || 'Unknown error';
      setError(message.includes('blocked by client') || message.includes('ERR_BLOCKED_BY_CLIENT')
        ? 'This browser is blocking Firestore requests. Please allow firestore.googleapis.com or disable an ad blocker for this site and try again.'
        : message);
      alert('Error: ' + message);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '480px', margin: '64px auto', textAlign: 'center', padding: '32px' }} className="card">
        <Hospital size={32} color="#E30613" />
        <h3 style={{ margin: '16px 0 8px', color: '#0F172A' }}>Verifying Invitation Token...</h3>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Connecting to BloodConnect Security Authority</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div style={{ maxWidth: '480px', margin: '64px auto', textAlign: 'center', padding: '32px' }} className="card">
        <AlertCircle size={40} color="#DC2626" />
        <h3 style={{ margin: '16px 0 8px', color: '#0F172A' }}>Invalid or Expired Invitation Token</h3>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>
          Please request a new registration invitation link from the BloodConnect Admin team.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '48px auto 64px', padding: '0 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.3)'
          }}>
            <Hospital size={28} color="#FFFFFF" />
          </div>
          <h2 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '24px', fontWeight: '800' }}>
            Hospital Partner Registration
          </h2>
          <span className="badge badge-success" style={{ marginTop: '4px' }}>
            <ShieldCheck size={14} /> Verified Admin Invitation Token
          </span>
        </div>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '6px' }}><strong>Hospital Name:</strong> {invitation.hospitalName}</div>
          <div style={{ marginBottom: '6px' }}><strong>Email:</strong> {invitation.email}</div>
          <div><strong>City:</strong> {invitation.city}</div>
        </div>

        {error && (
          <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              Set Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ paddingLeft: '42px' }}
                required
                minLength="6"
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            <CheckCircle2 size={18} /> Register Hospital Account
          </button>
        </form>
      </div>
    </div>
  );
}
