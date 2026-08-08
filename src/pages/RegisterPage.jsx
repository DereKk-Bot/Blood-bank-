import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLOOD_GROUPS } from '../utils/bloodUtils';
import { validateEmail, validateName, validatePassword, validatePhone, validateMinimumAge, isNonEmpty } from '../utils/validationUtils';
import { User, Mail, Lock, Phone, MapPin, Calendar, Heart, Navigation, CheckCircle, Droplet } from 'lucide-react';

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', city: '', address: '',
    bloodGroup: 'O+', dateOfBirth: '', height: '170', weight: '70', emergencyContact: '',
    latitude: '', longitude: '', locationSharedAt: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    if (!validateName(formData.fullName)) nextErrors.fullName = 'Full name must be at least 2 characters.';
    if (!validateEmail(formData.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!validatePassword(formData.password)) nextErrors.password = 'Password must be at least 6 characters.';
    if (!validatePhone(formData.phone)) nextErrors.phone = 'Please enter a valid phone number.';
    if (!isNonEmpty(formData.city)) nextErrors.city = 'City is required.';
    if (!isNonEmpty(formData.address)) nextErrors.address = 'Address is required.';
    if (role === 'DONOR') {
      if (!isNonEmpty(formData.dateOfBirth)) nextErrors.dateOfBirth = 'Date of birth is required.';
      else if (!validateMinimumAge(formData.dateOfBirth)) nextErrors.dateOfBirth = 'You must be at least 18 years old.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await registerUser(formData.email, formData.password, role, formData);
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

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
      alert('Geolocation is not supported by this browser.');
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
          } catch (error) {
            alert('Unable to resolve your current address.');
          } finally {
            setLocationLoading(false);
          }
        })();
      },
      () => {
        setLocationLoading(false);
        alert('Unable to read your current location. Please allow location access and try again.');
      }
    );
  };

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto 64px', padding: '0 16px' }}>
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
          <h2 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '26px', fontWeight: '800' }}>
            Create Your Account
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            Join the emergency response network as a voluntary donor or recipient.
          </p>
        </div>

        {/* Account Role Selector Pills */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
            Select Account Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setRole('DONOR')}
              style={{
                background: role === 'DONOR' ? '#E30613' : '#F8FAFC',
                color: role === 'DONOR' ? '#FFFFFF' : '#64748B',
                border: `1.5px solid ${role === 'DONOR' ? '#E30613' : '#CBD5E1'}`,
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart size={16} fill={role === 'DONOR' ? '#FFFFFF' : 'none'} /> Voluntary Donor
            </button>
            <button
              type="button"
              onClick={() => setRole('RECIPIENT')}
              style={{
                background: role === 'RECIPIENT' ? '#E30613' : '#F8FAFC',
                color: role === 'RECIPIENT' ? '#FFFFFF' : '#64748B',
                border: `1.5px solid ${role === 'RECIPIENT' ? '#E30613' : '#CBD5E1'}`,
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={16} /> Recipient User
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={e => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.fullName && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.fullName}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.email && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={e => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.password && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={e => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.phone && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                City
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="New York"
                  value={formData.city}
                  onChange={e => { setFormData({ ...formData, city: e.target.value }); setErrors({ ...errors, city: '' }); }}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.city && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.city}</div>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Full Address
              </label>
              <input
                type="text"
                placeholder="123 Main St"
                value={formData.address}
                onChange={e => { setFormData({ ...formData, address: e.target.value }); setErrors({ ...errors, address: '' }); }}
                required
              />
              {errors.address && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.address}</div>}
            </div>
          </div>

          {/* Location Picker Action Button */}
          <div style={{ margin: '16px 0', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="secondary-btn"
                disabled={locationLoading}
                style={{ fontSize: '13px' }}
              >
                <Navigation size={16} />
                {locationLoading ? 'Detecting Location...' : 'Use Current GPS Location'}
              </button>
              {formData.latitude && formData.longitude && (
                <span className="badge badge-success" style={{ fontSize: '12px' }}>
                  <CheckCircle size={14} /> Lat: {formData.latitude}, Lng: {formData.longitude}
                </span>
              )}
            </div>
          </div>

          {role === 'DONOR' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Blood Group
                </label>
                <select value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Date of Birth
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => { setFormData({ ...formData, dateOfBirth: e.target.value }); setErrors({ ...errors, dateOfBirth: '' }); }}
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
                {errors.dateOfBirth && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{errors.dateOfBirth}</div>}
              </div>
            </div>
          )}

          <button type="submit" className="primary-btn" style={{ marginTop: '24px', width: '100%', padding: '14px', fontSize: '15px' }}>
            Complete Account Registration
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#E30613', fontWeight: '700', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
