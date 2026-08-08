import React, { useState } from 'react';
import { db, collection, addDoc } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/bloodUtils';
import { validatePhone, validateNumber, isNonEmpty } from '../../utils/validationUtils';
import { ShieldAlert, Phone, Droplet, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecipientEmergency() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ bloodGroup: 'O+', component: 'Packed RBC', unitsRequired: 1, urgency: 'CRITICAL', contactNumber: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateNumber(formData.unitsRequired, 1)) nextErrors.unitsRequired = 'At least 1 unit is required.';
    if (!validatePhone(formData.contactNumber)) nextErrors.contactNumber = 'Please enter a valid contact number.';
    if (!isNonEmpty(formData.bloodGroup)) nextErrors.bloodGroup = 'Choose a blood group.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const reqRef = await addDoc(collection(db, 'bloodRequests'), {
      requesterId: currentUser?.uid || 'GUEST', ...formData, status: 'PENDING', createdAt: new Date().toISOString()
    });

    await addDoc(collection(db, 'emergencyRequests'), {
      bloodRequestId: reqRef.id, ...formData, status: 'PENDING', createdAt: new Date().toISOString()
    });

    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto 64px', padding: '0 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)',
            animation: 'pulseGlow 2s infinite'
          }}>
            <ShieldAlert size={30} color="#FFFFFF" />
          </div>
          <h2 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '24px', fontWeight: '800' }}>
            Emergency Blood Request
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            Triggers high-priority donor matching across active blood banks and community donors.
          </p>
        </div>

        {submitted ? (
          <div style={{
            background: '#DCFCE7',
            border: '1.5px solid #86EFAC',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            color: '#15803D'
          }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>Emergency Request Broadcasted!</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#166534' }}>
              Your emergency requirement has been sent directly to the Admin Dispatch & Hospital Matching Hub. You will receive updates via your contact phone number.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Required Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                style={{ fontWeight: '800', fontSize: '15px' }}
              >
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Blood Component Needed
              </label>
              <select
                value={formData.component}
                onChange={e => setFormData({ ...formData, component: e.target.value })}
              >
                {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Units Required (Pints)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsRequired}
                  onChange={e => { setFormData({ ...formData, unitsRequired: e.target.value }); setErrors({ ...errors, unitsRequired: '' }); }}
                  required
                />
                {errors.unitsRequired && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.unitsRequired}</div>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  style={{ background: formData.urgency === 'CRITICAL' ? '#FFE4E6' : '#FFFFFF', color: formData.urgency === 'CRITICAL' ? '#BE123C' : '#0F172A', fontWeight: '700' }}
                >
                  <option value="CRITICAL">CRITICAL (Immediate)</option>
                  <option value="HIGH">HIGH (&lt; 2 Hours)</option>
                  <option value="MEDIUM">MEDIUM (Today)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Emergency Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.contactNumber}
                  onChange={e => { setFormData({ ...formData, contactNumber: e.target.value }); setErrors({ ...errors, contactNumber: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.contactNumber && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.contactNumber}</div>}
            </div>

            <button type="submit" className="emergency-btn" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              <ShieldAlert size={18} /> Submit Emergency Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
