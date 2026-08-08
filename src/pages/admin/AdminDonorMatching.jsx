import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc } from '../../utils/firebase';
import { isRBCCompatible, checkDonorEligibility } from '../../utils/bloodUtils';

export default function AdminDonorMatching({ emergencyRequest }) {
  const [matchedDonors, setMatchedDonors] = useState([]);

  useEffect(() => {
    async function match() {
      const snap = await getDocs(collection(db, 'donors'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const matched = list.map(donor => ({
        ...donor,
        isCompatible: isRBCCompatible(donor.bloodGroup, emergencyRequest.bloodGroup),
        eligibility: checkDonorEligibility(donor.lastDonationDate, 15)
      }));

      setMatchedDonors(matched);
    }
    match();
  }, [emergencyRequest]);

  const handleNotifyDonor = async (donor) => {
    await addDoc(collection(db, 'donorEmergencyRequests'), {
      emergencyRequestId: emergencyRequest.id,
      donorId: donor.donorId || donor.id,
      sentAt: new Date().toISOString(),
      response: 'PENDING'
    });

    await addDoc(collection(db, 'notifications'), {
      userId: donor.donorId || donor.id,
      title: 'URGENT BLOOD DONATION REQUEST',
      message: `Emergency blood group ${emergencyRequest.bloodGroup} requested!`,
      read: false,
      createdAt: new Date().toISOString()
    });

    alert('Emergency request sent to donor!');
  };

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
      <h4>Donor Matching for Group: {emergencyRequest.bloodGroup}</h4>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead><tr style={{ background: '#eee' }}><th>Blood Group</th><th>City</th><th>Eligibility</th><th>Action</th></tr></thead>
        <tbody>
          {matchedDonors.map(d => (
            <tr key={d.id}>
              <td><strong>{d.bloodGroup}</strong></td><td>{d.city}</td>
              <td>{d.eligibility.eligible ? 'Eligible' : 'Interval Restriction'}</td>
              <td>
                <button disabled={!d.eligibility.eligible || !d.isCompatible} onClick={() => handleNotifyDonor(d)} style={{ background: d.eligibility.eligible ? '#28a745' : '#ccc', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                  Send Alert
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
