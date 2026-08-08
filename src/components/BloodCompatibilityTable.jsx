import React, { useState } from 'react';
import { Check, X, ShieldAlert, Sparkles, Droplet, ArrowRight, Heart } from 'lucide-react';
import { BLOOD_GROUPS, isBloodCompatible } from '../utils/bloodUtils';

export default function BloodCompatibilityTable() {
  const [activeTab, setActiveTab] = useState('rbc');
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [checkDonor, setCheckDonor] = useState('O-');
  const [checkRecipient, setCheckRecipient] = useState('A+');

  const rbcMatrix = [
    { type: 'O-', donateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['O-'], universalDonor: true },
    { type: 'O+', donateTo: ['O+', 'A+', 'B+', 'AB+'], receiveFrom: ['O-', 'O+'] },
    { type: 'A-', donateTo: ['A-', 'A+', 'AB-', 'AB+'], receiveFrom: ['O-', 'A-'] },
    { type: 'A+', donateTo: ['A+', 'AB+'], receiveFrom: ['O-', 'O+', 'A-', 'A+'] },
    { type: 'B-', donateTo: ['B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['O-', 'B-'] },
    { type: 'B+', donateTo: ['B+', 'AB+'], receiveFrom: ['O-', 'O+', 'B-', 'B+'] },
    { type: 'AB-', donateTo: ['AB-', 'AB+'], receiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
    { type: 'AB+', donateTo: ['AB+'], receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], universalRecipient: true }
  ];

  const plasmaMatrix = [
    { type: 'AB', donateTo: ['O', 'A', 'B', 'AB'], receiveFrom: ['AB'], universalDonor: true },
    { type: 'A', donateTo: ['A', 'O'], receiveFrom: ['A', 'AB'] },
    { type: 'B', donateTo: ['B', 'O'], receiveFrom: ['B', 'AB'] },
    { type: 'O', donateTo: ['O'], receiveFrom: ['O', 'A', 'B', 'AB'], universalRecipient: true }
  ];

  const isCheckCompatible = isBloodCompatible(checkDonor, checkRecipient);
  const currentGroupData = rbcMatrix.find(item => item.type === selectedGroup);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Compatibility Checker Widget */}
      <div className="card" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
        color: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#F43F5E" />
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F43F5E' }}>
            Instant Transfusion Compatibility Checker
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
              Donor Blood Group
            </label>
            <select
              value={checkDonor}
              onChange={e => setCheckDonor(e.target.value)}
              style={{ background: '#0F172A', color: '#FFF', borderColor: '#334155', borderRadius: '12px', fontWeight: '700' }}
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
              <ArrowRight size={20} color="#F43F5E" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>
              Recipient Blood Group
            </label>
            <select
              value={checkRecipient}
              onChange={e => setCheckRecipient(e.target.value)}
              style={{ background: '#0F172A', color: '#FFF', borderColor: '#334155', borderRadius: '12px', fontWeight: '700' }}
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', marginBottom: '6px' }}>Crossmatch Result</div>
            <div style={{
              background: isCheckCompatible ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1.5px solid ${isCheckCompatible ? '#22C55E' : '#EF4444'}`,
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              fontWeight: '800',
              color: isCheckCompatible ? '#4ADE80' : '#FCA5A5'
            }}>
              {isCheckCompatible ? <Check size={20} /> : <X size={20} />}
              {isCheckCompatible ? 'TRANSFUSION COMPATIBLE' : 'INCOMPATIBLE DONATION'}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Tab Navigation */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '20px' }}>Compatibility Explorer</h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>Select a blood group to view compatible donors & recipients</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('rbc')}
              style={{
                background: activeTab === 'rbc' ? '#E30613' : 'transparent',
                color: activeTab === 'rbc' ? '#FFF' : '#64748B',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Red Blood Cells (RBC)
            </button>
            <button
              onClick={() => setActiveTab('plasma')}
              style={{
                background: activeTab === 'plasma' ? '#E30613' : 'transparent',
                color: activeTab === 'plasma' ? '#FFF' : '#64748B',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Plasma Transfusion
            </button>
          </div>
        </div>

        {/* Quick Blood Group Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              style={{
                background: selectedGroup === bg ? '#E30613' : '#F8FAFC',
                color: selectedGroup === bg ? '#FFFFFF' : '#0F172A',
                border: `1.5px solid ${selectedGroup === bg ? '#E30613' : '#CBD5E1'}`,
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedGroup === bg ? '0 4px 12px rgba(227, 6, 19, 0.3)' : 'none'
              }}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Interactive Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'rbc' ? (
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Can Donate RBC To</th>
                  <th>Can Receive RBC From</th>
                  <th>Special Designation</th>
                </tr>
              </thead>
              <tbody>
                {rbcMatrix.map(row => {
                  const isSelected = row.type === selectedGroup;
                  return (
                    <tr
                      key={row.type}
                      style={{
                        background: isSelected ? '#FFF1F2' : 'transparent',
                        fontWeight: isSelected ? '700' : 'normal'
                      }}
                    >
                      <td>
                        <span style={{
                          background: isSelected ? '#E30613' : '#0F172A',
                          color: '#FFFFFF',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontWeight: '800'
                        }}>
                          {row.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {row.donateTo.map(target => (
                            <span
                              key={target}
                              className={`badge ${selectedGroup === target ? 'badge-danger' : 'badge-info'}`}
                            >
                              {target}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {row.receiveFrom.map(src => (
                            <span
                              key={src}
                              className={`badge ${selectedGroup === src ? 'badge-danger' : 'badge-success'}`}
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {row.universalDonor && (
                          <span className="badge badge-danger">
                            <Droplet size={12} fill="#BE123C" /> Universal RBC Donor
                          </span>
                        )}
                        {row.universalRecipient && (
                          <span className="badge badge-success">
                            <Heart size={12} fill="#15803D" /> Universal RBC Recipient
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Can Donate Plasma To</th>
                  <th>Can Receive Plasma From</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                {plasmaMatrix.map(row => (
                  <tr key={row.type}>
                    <td>
                      <span style={{ background: '#0F172A', color: '#FFF', padding: '4px 12px', borderRadius: '8px', fontWeight: '800' }}>
                        {row.type}
                      </span>
                    </td>
                    <td>{row.donateTo.join(', ')}</td>
                    <td>{row.receiveFrom.join(', ')}</td>
                    <td>
                      {row.universalDonor && <span className="badge badge-danger">Universal Plasma Donor</span>}
                      {row.universalRecipient && <span className="badge badge-success">Universal Plasma Recipient</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #FCD34D',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#92400E'
      }}>
        <ShieldAlert size={24} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Medical Notice:</strong> Blood compatibility charts are provided for educational reference. Laboratory cross-matching, antibody screening, and medical practitioner verification are mandatory prior to any clinical transfusion.
        </div>
      </div>
    </div>
  );
}
