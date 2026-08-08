import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from '../../utils/firebase';
import { getBagExpirationStatus, BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/bloodUtils';
import { validateDateNotFuture, isNonEmpty } from '../../utils/validationUtils';
import { Hospital, MapPin, Navigation, Plus, CheckCircle2, Clock, AlertTriangle, Droplet } from 'lucide-react';

export default function HospitalDashboard() {
  const { userProfile } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [newBagErrors, setNewBagErrors] = useState({});
  const [newBag, setNewBag] = useState({ bloodBagId: '', bloodGroup: 'O+', component: 'Packed RBC', expirationDate: '' });

  useEffect(() => {
    if (userProfile?.userId) {
      loadData();
    }
  }, [userProfile]);

  async function loadData() {
    const hSnap = await getDoc(doc(db, 'hospitals', userProfile.userId));
    if (hSnap.exists()) {
      const data = hSnap.data();
      setAddress(data.address || '');
      setCity(data.city || '');
      setLat(data.latitude || '');
      setLng(data.longitude || '');
    }

    const q = query(collection(db, 'bloodInventory'), where('hospitalId', '==', userProfile.userId));
    const invSnap = await getDocs(q);
    setInventory(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  const resolveAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (!response.ok) throw new Error('Unable to resolve address');
      const data = await response.json();
      return {
        address: data.display_name || '',
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || ''
      };
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
            setLat(position.coords.latitude.toFixed(6));
            setLng(position.coords.longitude.toFixed(6));
            setAddress(resolved?.address || '');
            setCity(resolved?.city || '');
            alert('Current location fetched successfully.');
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

  const handleSaveLocation = async () => {
    await updateDoc(doc(db, 'hospitals', userProfile.userId), {
      address,
      city,
      latitude: parseFloat(lat) || 0,
      longitude: parseFloat(lng) || 0
    });
    alert('Location information saved!');
  };

  const handleAddBag = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!isNonEmpty(newBag.bloodBagId)) nextErrors.bloodBagId = 'Bag ID is required.';
    if (!isNonEmpty(newBag.expirationDate)) nextErrors.expirationDate = 'Expiration date is required.';
    else if (!validateDateNotFuture(newBag.expirationDate)) nextErrors.expirationDate = 'Expiration date cannot be in the future.';
    setNewBagErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await addDoc(collection(db, 'bloodInventory'), {
      ...newBag, hospitalId: userProfile.userId, status: 'AVAILABLE', createdAt: new Date().toISOString()
    });
    alert('Blood Bag added!');
    setNewBag({ bloodBagId: '', bloodGroup: 'O+', component: 'Packed RBC', expirationDate: '' });
    loadData();
  };

  return (
    <div className="page-shell">
      <div style={{ marginBottom: '28px' }}>
        <div className="section-label">
          <Hospital size={14} /> Hospital Portal
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>
          Hospital Blood Inventory & Dispatch
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Hospital Location Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#E30613" /> Hospital Address & GPS Coordinates
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Facility Street Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>City / Region</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '12px', color: '#64748B' }}>Latitude</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="0.000000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '12px', color: '#64748B' }}>Longitude</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="0.000000" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={handleUseCurrentLocation} className="secondary-btn" disabled={locationLoading} style={{ flex: 1, fontSize: '13px' }}>
                <Navigation size={15} /> {locationLoading ? 'Locating...' : 'GPS Detect'}
              </button>
              <button type="button" onClick={handleSaveLocation} className="primary-btn" style={{ flex: 1, fontSize: '13px' }}>
                Save Location
              </button>
            </div>
          </div>
        </div>

        {/* Add Blood Bag Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#E30613" /> Register New Blood Bag
          </h3>

          <form onSubmit={handleAddBag} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Blood Bag Serial ID</label>
              <input type="text" placeholder="BAG-10029" value={newBag.bloodBagId} onChange={e => { setNewBag({ ...newBag, bloodBagId: e.target.value }); setNewBagErrors({ ...newBagErrors, bloodBagId: '' }); }} required />
              {newBagErrors.bloodBagId && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{newBagErrors.bloodBagId}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Blood Group</label>
                <select value={newBag.bloodGroup} onChange={e => setNewBag({ ...newBag, bloodGroup: e.target.value })}>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Component</label>
                <select value={newBag.component} onChange={e => setNewBag({ ...newBag, component: e.target.value })}>
                  {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>Expiration Date</label>
              <input type="date" value={newBag.expirationDate} onChange={e => { setNewBag({ ...newBag, expirationDate: e.target.value }); setNewBagErrors({ ...newBagErrors, expirationDate: '' }); }} required />
              {newBagErrors.expirationDate && <div style={{ color: '#E30613', fontSize: '12px', marginTop: '4px' }}>{newBagErrors.expirationDate}</div>}
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: '8px', padding: '12px' }}>
              <Plus size={16} /> Add Bag to Active Inventory
            </button>
          </form>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplet size={18} color="#E30613" /> Current Inventory Units ({inventory.length} total)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Bag ID</th>
                <th>Group</th>
                <th>Component</th>
                <th>Expiration Date</th>
                <th>Quality Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => {
                const status = getBagExpirationStatus(i.expirationDate);
                return (
                  <tr key={i.id}>
                    <td><strong>{i.bloodBagId}</strong></td>
                    <td>
                      <span className="badge badge-danger" style={{ fontSize: '14px', fontWeight: '800' }}>{i.bloodGroup}</span>
                    </td>
                    <td>{i.component}</td>
                    <td>{i.expirationDate}</td>
                    <td>
                      {status === 'FRESH' && <span className="badge badge-success"><CheckCircle2 size={12} /> FRESH</span>}
                      {status === 'EXPIRING_SOON' && <span className="badge badge-warning"><Clock size={12} /> EXPIRING SOON</span>}
                      {status === 'EXPIRED' && <span className="badge badge-danger"><AlertTriangle size={12} /> EXPIRED</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
