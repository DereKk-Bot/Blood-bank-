import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLOOD_GROUPS } from '../utils/bloodUtils';
import { User, Mail, Phone, MapPin, Navigation, Heart, CheckCircle2, ShieldCheck, Save, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', address: '',
    bloodGroup: 'O+', dateOfBirth: '', height: '170', weight: '70', emergencyContact: '',
    latitude: '', longitude: '', locationSharedAt: ''
  });
  const [inventory, setInventory] = useState({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser || !userProfile) return;
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      city: userProfile.city || '',
      address: userProfile.address || '',
      bloodGroup: userProfile.bloodGroup || 'O+',
      dateOfBirth: userProfile.dateOfBirth || '',
      height: userProfile.height || '170',
      weight: userProfile.weight || '70',
      emergencyContact: userProfile.emergencyContact || '',
      latitude: userProfile.latitude ?? '',
      longitude: userProfile.longitude ?? '',
      locationSharedAt: userProfile.locationSharedAt || ''
    });

    if (userProfile?.role === 'HOSPITAL') {
      const nextInventory = {
        'A+': userProfile.inventory?.['A+'] ?? 0,
        'A-': userProfile.inventory?.['A-'] ?? 0,
        'B+': userProfile.inventory?.['B+'] ?? 0,
        'B-': userProfile.inventory?.['B-'] ?? 0,
        'AB+': userProfile.inventory?.['AB+'] ?? 0,
        'AB-': userProfile.inventory?.['AB-'] ?? 0,
        'O+': userProfile.inventory?.['O+'] ?? 0,
        'O-': userProfile.inventory?.['O-'] ?? 0
      };
      setInventory(nextInventory);
    }
  }, [currentUser, userProfile]);

  const resolveAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (!response.ok) throw new Error('Unable to resolve address');
      const data = await response.json();
      const address = data.display_name || '';
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      return { address, city };
    } catch (error) {
      return null;
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const resolved = await resolveAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
            setFormData((prev) => ({
              ...prev,
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
              locationSharedAt: new Date().toISOString(),
              address: resolved?.address || prev.address,
              city: resolved?.city || prev.city
            }));
            setMessage('Current location has been filled into your address field.');
          } catch (error) {
            setMessage('Unable to resolve your current address.');
          } finally {
            setLocationLoading(false);
          }
        })();
      },
      () => {
        setLocationLoading(false);
        setMessage('Unable to read your current location. Please allow location access and try again.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        inventory: userProfile?.role === 'HOSPITAL' ? inventory : undefined
      };
      await updateUserProfile(currentUser.uid, payload, userProfile?.role);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '480px', margin: '48px auto', textAlign: 'center', padding: '32px' }} className="card">
        <User size={36} color="#E30613" />
        <h2 style={{ margin: '16px 0 8px', color: '#0F172A' }}>Sign in to view your profile</h2>
        <button onClick={() => navigate('/login')} className="primary-btn" style={{ marginTop: '12px' }}>
          Go to Sign In
        </button>
      </div>
    );
  }

  const userInitial = formData.name ? formData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '780px', margin: '40px auto 64px', padding: '0 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        {/* Profile Header Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          paddingBottom: '24px',
          marginBottom: '28px',
          borderBottom: '1px solid #E2E8F0',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E30613 0%, #BE123C 100%)',
            color: '#FFFFFF',
            fontSize: '28px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(227, 6, 19, 0.3)'
          }}>
            {userInitial}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
                {formData.name || 'User Profile'}
              </h2>
              <span className="badge badge-dark" style={{ textTransform: 'uppercase' }}>
                {userProfile?.role || 'USER'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
              {formData.email} • Registered Account
            </p>
          </div>
        </div>

        {message && (
          <div style={{
            background: message.includes('success') ? '#DCFCE7' : '#FFE4E6',
            border: `1px solid ${message.includes('success') ? '#86EFAC' : '#FECDD3'}`,
            color: message.includes('success') ? '#15803D' : '#BE123C',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                City
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required style={{ paddingLeft: '42px' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              Full Address
            </label>
            <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          {/* Location Detection Button */}
          <div style={{ margin: '16px 0 24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="secondary-btn"
                disabled={locationLoading}
                style={{ fontSize: '13px' }}
              >
                <Navigation size={16} />
                {locationLoading ? 'Detecting Location...' : 'Detect & Update Location'}
              </button>
              {formData.latitude && formData.longitude && (
                <span className="badge badge-success" style={{ fontSize: '12px' }}>
                  <CheckCircle2 size={14} /> Lat: {formData.latitude}, Lng: {formData.longitude}
                </span>
              )}
            </div>
          </div>

          {userProfile?.role === 'DONOR' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', padding: '20px', background: '#FFF1F2', borderRadius: '16px', border: '1px solid #FECDD3' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#BE123C' }}>Blood Group</label>
                <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} style={{ fontWeight: '800' }}>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#BE123C' }}>Date of Birth</label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#BE123C' }}>Height (cm)</label>
                <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#BE123C' }}>Weight (kg)</label>
                <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
              </div>
            </div>
          )}

          {userProfile?.role === 'HOSPITAL' && (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', marginBottom: '24px', background: '#F8FAFC' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A' }}>Hospital Stock Summary</h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748B' }}>Quick units breakdown per blood type.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                {Object.entries(inventory).map(([group, units]) => (
                  <div key={group}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '12px', color: '#334155' }}>{group}</label>
                    <input
                      type="number"
                      min="0"
                      value={units}
                      onChange={(e) => setInventory((prev) => ({ ...prev, [group]: Number(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            <Save size={18} /> {loading ? 'Saving Profile Updates...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
