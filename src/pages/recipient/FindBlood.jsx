import React, { useState } from 'react';
import { db, collection, getDocs } from '../../utils/firebase';
import { BLOOD_GROUPS, BLOOD_COMPONENTS, getBagExpirationStatus } from '../../utils/bloodUtils';
import { Search, Droplet, Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FindBlood() {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Packed RBC');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const snap = await getDocs(collection(db, 'bloodInventory'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = list.filter(item => 
      item.bloodGroup === bloodGroup && 
      item.component === component && 
      getBagExpirationStatus(item.expirationDate) !== 'EXPIRED'
    );

    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="page-shell" style={{ maxWidth: '1000px' }}>
      <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Search size={22} color="#E30613" />
          <h2 style={{ margin: 0, color: '#0F172A', fontSize: '24px', fontWeight: '800' }}>
            Find Compatible Blood Stock
          </h2>
        </div>
        <p style={{ color: '#64748B', marginTop: 0, marginBottom: '24px', fontSize: '15px' }}>
          Search real-time active inventory in connected regional blood banks and hospitals.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              Select Required Blood Group
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    background: bloodGroup === bg ? '#E30613' : '#F8FAFC',
                    color: bloodGroup === bg ? '#FFFFFF' : '#0F172A',
                    border: `1.5px solid ${bloodGroup === bg ? '#E30613' : '#CBD5E1'}`,
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Blood Component Type
              </label>
              <select value={component} onChange={e => setComponent(e.target.value)}>
                {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="submit" className="primary-btn" style={{ padding: '12px 28px', height: '46px' }}>
              <Search size={18} /> Search Inventory
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>
              Search Results ({results.length} units available)
            </h3>
            {results.length === 0 && (
              <Link to="/emergency-request">
                <button className="emergency-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <ShieldAlert size={16} /> Request Emergency Donor Match
                </button>
              </Link>
            )}
          </div>

          {results.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Blood Bag ID</th>
                    <th>Group</th>
                    <th>Component</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const status = getBagExpirationStatus(r.expirationDate);
                    return (
                      <tr key={r.id}>
                        <td><strong>{r.bloodBagId}</strong></td>
                        <td>
                          <span className="badge badge-danger">{r.bloodGroup}</span>
                        </td>
                        <td>{r.component}</td>
                        <td>{r.expirationDate}</td>
                        <td>
                          {status === 'FRESH' && <span className="badge badge-success"><CheckCircle2 size={12} /> Fresh Stock</span>}
                          {status === 'EXPIRING_SOON' && <span className="badge badge-warning"><Clock size={12} /> Expiring Soon</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
              <Droplet size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0, fontWeight: '600' }}>No available matching inventory found in immediate stock.</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Submit an emergency request to trigger automated donor alerts.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
