import React from 'react';
import BloodCompatibilityTable from '../components/BloodCompatibilityTable';

export default function BloodCompatibilityPage() {
  return (
    <div className="page-shell">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
          Blood Compatibility & Transfusion Guide
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '16px' }}>
          Understand donor and recipient blood group matching rules for red blood cells and plasma transfusions.
        </p>
      </div>
      <BloodCompatibilityTable />
    </div>
  );
}
