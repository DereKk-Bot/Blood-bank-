const fs = require('fs');
const path = require('path');

// 1. Folders to generate
const dirs = [
  'public',
  'src',
  'src/assets',
  'src/components',
  'src/contexts',
  'src/utils',
  'src/pages',
  'src/pages/admin',
  'src/pages/hospital',
  'src/pages/donor',
  'src/pages/recipient'
];

// 2. Complete Project Files Database
const files = {
  'package.json': JSON.stringify({
    name: 'bloodconnect',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      lint: 'vite lint',
      preview: 'vite preview'
    },
    dependencies: {
      firebase: '^10.12.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-router-dom': '^6.23.1'
    },
    devDependencies: {
      '@types/react': '^18.3.3',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.0',
      vite: '^5.2.11'
    }
  }, null, 2),

  'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BloodConnect - Emergency Blood Donation System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,

  'firestore.rules': `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function isAdmin() { return isSignedIn() && getUserData().role == 'ADMIN'; }
    function isHospital() { return isSignedIn() && getUserData().role == 'HOSPITAL'; }
    function isDonor() { return isSignedIn() && getUserData().role == 'DONOR'; }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    match /hospitals/{hospitalId} {
      allow read: if true;
      allow create: if true;
      allow update: if isSignedIn() && (resource.data.hospitalId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
    match /donors/{donorId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && (donorId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
    match /recipients/{recipientId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && (recipientId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
    match /bloodInventory/{inventoryId} {
      allow read: if true;
      allow create, update, delete: if isHospital() || isAdmin();
    }
    match /bloodRequests/{requestId} {
      allow read, create, update: if isSignedIn();
    }
    match /emergencyRequests/{emergencyRequestId} {
      allow read, create: if isSignedIn();
      allow update, delete: if isAdmin();
    }
    match /donorEmergencyRequests/{requestId} {
      allow read: if isSignedIn();
      allow create: if isAdmin();
      allow update: if isSignedIn();
    }
    match /appointments/{appointmentId} {
      allow read, create, update: if isSignedIn();
    }
    match /donations/{donationId} {
      allow read: if isSignedIn();
      allow create, update: if isHospital() || isAdmin();
    }
    match /notifications/{notificationId} {
      allow read, update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
    }
    match /hospitalInvitations/{invitationId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
`,

  'public/firebase-messaging-sw.js': `importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'Emergency Blood Alert';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`,

  '.env.example': `VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
`,

  'src/App.css': `body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}
input, select, button {
  font-family: inherit;
  font-size: 14px;
}
table {
  border-collapse: collapse;
}
`,

  'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,

  'src/utils/firebase.js': `import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging not supported in current environment.");
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  getToken,
  onMessage
};
`,

  'src/utils/distanceUtils.js': `export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
`,

  'src/utils/bloodUtils.js': `export const RBC_COMPATIBILITY = {
  'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
  'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
  'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
};

export const PLASMA_COMPATIBILITY = {
  'O': { canDonateTo: ['O'], canReceiveFrom: ['O', 'A', 'B', 'AB'] },
  'A': { canDonateTo: ['A', 'O'], canReceiveFrom: ['A', 'AB'] },
  'B': { canDonateTo: ['B', 'O'], canReceiveFrom: ['B', 'AB'] },
  'AB': { canDonateTo: ['AB', 'A', 'B', 'O'], canReceiveFrom: ['AB'] },
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const BLOOD_COMPONENTS = ['Whole Blood', 'Packed RBC', 'Plasma', 'Platelets'];

export function isRBCCompatible(donorGroup, recipientGroup) {
  if (!RBC_COMPATIBILITY[donorGroup]) return false;
  return RBC_COMPATIBILITY[donorGroup].canDonateTo.includes(recipientGroup);
}

export function getBagExpirationStatus(expirationDateString) {
  if (!expirationDateString) return 'UNKNOWN';
  const expDate = new Date(expirationDateString);
  const today = new Date();
  expDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 5) return 'EXPIRING_SOON';
  return 'AVAILABLE';
}

export function checkDonorEligibility(lastDonationDateString, configuredDays = 15) {
  if (!lastDonationDateString) return { eligible: true, daysRemaining: 0, reason: 'No prior donation record' };
  const lastDate = new Date(lastDonationDateString);
  const today = new Date();
  const diffTime = today - lastDate;
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (daysSince >= configuredDays) return { eligible: true, daysRemaining: 0, daysSince };
  return { 
    eligible: false, 
    daysRemaining: configuredDays - daysSince, 
    daysSince,
    reason: \`Donated \${daysSince} days ago. Minimum interval is \${configuredDays} days.\`
  };
}
`,

  'src/contexts/AuthContext.jsx': `import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, 
  doc, getDoc, setDoc 
} from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const profile = userSnap.data();
        setUserProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async function registerUser(email, password, role, additionalData) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    const userData = {
      userId: user.uid,
      name: additionalData.fullName || additionalData.name || '',
      email,
      phone: additionalData.mobileNumber || additionalData.phone || '',
      role,
      city: additionalData.city || '',
      address: additionalData.address || '',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    if (role === 'DONOR') {
      await setDoc(doc(db, 'donors', user.uid), {
        donorId: user.uid,
        userId: user.uid,
        bloodGroup: additionalData.bloodGroup,
        dateOfBirth: additionalData.dateOfBirth,
        height: additionalData.height,
        weight: additionalData.weight,
        city: additionalData.city,
        address: additionalData.address,
        latitude: parseFloat(additionalData.latitude) || 0,
        longitude: parseFloat(additionalData.longitude) || 0,
        lastDonationDate: null,
        donationCount: 0,
        eligibilityStatus: 'ELIGIBLE',
        createdAt: new Date().toISOString()
      });
    } else if (role === 'RECIPIENT') {
      await setDoc(doc(db, 'recipients', user.uid), {
        recipientId: user.uid,
        userId: user.uid,
        city: additionalData.city,
        address: additionalData.address,
        emergencyContact: additionalData.emergencyContact || '',
        createdAt: new Date().toISOString()
      });
    }

    await fetchUserProfile(user.uid);
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, userProfile, login, registerUser, logout, resetPassword, fetchUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
`,

  'src/contexts/NotificationContext.jsx': `import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, collection, query, where, onSnapshot, doc, updateDoc, messaging, getToken } from '../utils/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() { return useContext(NotificationContext); }

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
`,

  'src/components/Navbar.jsx': `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#333', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>BloodConnect</Link>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
        <Link to="/compatibility" style={{ color: '#fff', textDecoration: 'none' }}>Blood Compatibility</Link>
        <Link to="/find-blood" style={{ color: '#fff', textDecoration: 'none' }}>Find Blood</Link>
        <Link to="/donor-intro" style={{ color: '#fff', textDecoration: 'none' }}>Donate Blood</Link>
        <Link to="/emergency-request" style={{ color: '#fff', textDecoration: 'none' }}>Emergency Request</Link>

        {currentUser ? (
          <>
            {userProfile?.role === 'ADMIN' && <Link to="/admin" style={{ color: '#ffcc00' }}>Admin Portal</Link>}
            {userProfile?.role === 'HOSPITAL' && <Link to="/hospital" style={{ color: '#ffcc00' }}>Hospital Dashboard</Link>}
            {userProfile?.role === 'DONOR' && <Link to="/donor" style={{ color: '#ffcc00' }}>Donor Dashboard</Link>}

            <span style={{ fontSize: '12px', background: '#555', padding: '3px 8px', borderRadius: '4px' }}>
              Alerts: {unreadCount}
            </span>

            <button onClick={handleLogout} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
`,

  'src/components/Footer.jsx': `import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#222', color: '#aaa', padding: '15px', textAlign: 'center', marginTop: 'auto', fontSize: '13px' }}>
      BloodConnect System © 2026 - Emergency Blood Donation & Management System
    </footer>
  );
}
`,

  'src/components/ProtectedRoute.jsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

export function RoleRoute({ allowedRoles, children }) {
  const { userProfile } = useAuth();
  if (!userProfile) return <div style={{ padding: '20px' }}>Loading permissions...</div>;
  if (allowedRoles.includes(userProfile.role)) {
    return children;
  }
  return <div style={{ padding: '20px' }}>Access Denied for role: {userProfile.role}</div>;
}
`,

  'src/components/BloodCompatibilityTable.jsx': `import React from 'react';

export default function BloodCompatibilityTable() {
  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', margin: '15px 0', background: '#fff' }}>
      <h3>Red Blood Cell Compatibility</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Blood Type</th>
            <th>Can Donate RBC To</th>
            <th>Can Receive RBC From</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>O-</strong></td><td>All Types (Universal RBC Donor)</td><td>O-</td></tr>
          <tr><td><strong>O+</strong></td><td>O+, A+, B+, AB+</td><td>O-, O+</td></tr>
          <tr><td><strong>A-</strong></td><td>A-, A+, AB-, AB+</td><td>O-, A-</td></tr>
          <tr><td><strong>A+</strong></td><td>A+, AB+</td><td>O-, O+, A-, A+</td></tr>
          <tr><td><strong>B-</strong></td><td>B-, B+, AB-, AB+</td><td>O-, B-</td></tr>
          <tr><td><strong>B+</strong></td><td>B+, AB+</td><td>O-, O+, B-, B+</td></tr>
          <tr><td><strong>AB-</strong></td><td>AB-, AB+</td><td>O-, A-, B-, AB-</td></tr>
          <tr><td><strong>AB+</strong></td><td>AB+ only</td><td>All Types (Universal RBC Recipient)</td></tr>
        </tbody>
      </table>

      <h3>Plasma Compatibility</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Blood Type</th>
            <th>Can Donate Plasma To</th>
            <th>Can Receive Plasma From</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>AB</strong></td><td>All Groups (Universal Plasma Donor)</td><td>AB</td></tr>
          <tr><td><strong>A</strong></td><td>A, O</td><td>A, AB</td></tr>
          <tr><td><strong>B</strong></td><td>B, O</td><td>B, AB</td></tr>
          <tr><td><strong>O</strong></td><td>O only</td><td>All Groups (Universal Plasma Recipient)</td></tr>
        </tbody>
      </table>

      <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', border: '1px solid #ffeeba' }}>
        <strong>Warning:</strong> Blood compatibility information is for general information only. Final transfusion decisions must be made by qualified medical professionals based on laboratory crossmatching.
      </div>
    </div>
  );
}
`,

  'src/components/DonorQuestionnaire.jsx': `import React, { useState } from 'react';

export default function DonorQuestionnaire({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '', heightCm: '', weightKg: '',
    q1_feelingHealthy: 'yes', q2_recentFever: 'no', q3_recentSurgery: 'no',
    q4_takingMedication: 'no', q5_recentTransfusion: 'no', q6_tattooPiercing: 'no'
  });
  const [result, setResult] = useState(null);

  const calculateBMI = () => {
    const hM = parseFloat(formData.heightCm) / 100;
    const wKg = parseFloat(formData.weightKg);
    return (hM > 0 && wKg > 0) ? (wKg / (hM * hM)).toFixed(1) : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const issueCount = 
      (formData.q1_feelingHealthy === 'no' ? 1 : 0) +
      (formData.q2_recentFever === 'yes' ? 1 : 0) +
      (formData.q3_recentSurgery === 'yes' ? 1 : 0) +
      (formData.q5_recentTransfusion === 'yes' ? 1 : 0) +
      (formData.q6_tattooPiercing === 'yes' ? 1 : 0);

    const bmi = calculateBMI();
    const passed = issueCount === 0;

    const evalRes = {
      status: passed ? 'PRE-SCREENING PASSED' : 'ADDITIONAL MEDICAL CHECK REQUIRED',
      message: passed 
        ? 'Based on your pre-screening answers, you appear eligible to proceed with booking an appointment.'
        : 'Based on your answers, we recommend speaking with a nearby blood bank professional before donating.',
      bmi,
      passed
    };

    setResult(evalRes);
    if (onComplete) onComplete(evalRes);
  };

  const bmiValue = calculateBMI();

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', background: '#fff' }}>
      <h3>Donor Pre-Screening Questionnaire</h3>
      <small style={{ color: '#666' }}>Note: Pre-screening only. Final eligibility is determined at the blood bank.</small>

      <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div><label>Age:</label><input type="number" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} required style={{ width: '100%' }} /></div>
          <div><label>Height (cm):</label><input type="number" value={formData.heightCm} onChange={e=>setFormData({...formData, heightCm: e.target.value})} required style={{ width: '100%' }} /></div>
          <div><label>Weight (kg):</label><input type="number" value={formData.weightKg} onChange={e=>setFormData({...formData, weightKg: e.target.value})} required style={{ width: '100%' }} /></div>
        </div>

        {bmiValue && <p style={{ background: '#eef', padding: '8px' }}>Calculated BMI: <strong>{bmiValue}</strong></p>}

        <p>1. Are you currently feeling healthy?</p>
        <select value={formData.q1_feelingHealthy} onChange={e=>setFormData({...formData, q1_feelingHealthy: e.target.value})}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select>

        <p>2. Have you had fever or infection recently?</p>
        <select value={formData.q2_recentFever} onChange={e=>setFormData({...formData, q2_recentFever: e.target.value})}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select>

        <p>3. Have you recently undergone surgery?</p>
        <select value={formData.q3_recentSurgery} onChange={e=>setFormData({...formData, q3_recentSurgery: e.target.value})}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select>

        <br /><br />
        <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Evaluate Answers
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '15px', padding: '10px', border: result.passed ? '2px solid green' : '2px solid orange' }}>
          <h4>{result.status}</h4>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
`,

  'src/pages/HomePage.jsx': `import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: '#e9ecef', padding: '40px 20px', textAlign: 'center', marginBottom: '25px' }}>
        <h1>Every Drop Can Save a Life</h1>
        <p>Emergency Blood Donation & Blood Bank Management System</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
          <Link to="/donor-intro"><button style={{ padding: '10px 20px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer' }}>Donate Blood</button></Link>
          <Link to="/login"><button style={{ padding: '10px 20px', background: '#0275d8', color: '#fff', border: 'none', cursor: 'pointer' }}>Hospital Login</button></Link>
          <Link to="/emergency-request"><button style={{ padding: '10px 20px', background: '#f0ad4e', color: '#fff', border: 'none', cursor: 'pointer' }}>Emergency Request</button></Link>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', background: '#fff' }}>
        <h2>Importance of Blood Donation</h2>
        <ul>
          <li><strong>Why it matters:</strong> Blood cannot be artificially synthesized. Emergency and trauma care rely on voluntary donations.</li>
          <li><strong>How it helps:</strong> Blood transfusions treat accident victims, surgery patients, anemia, and cancer complications.</li>
          <li><strong>Emergency Supply:</strong> Regular donations keep blood banks stocked for unexpected regional emergencies.</li>
        </ul>
      </div>
    </div>
  );
}
`,

  'src/pages/BloodCompatibilityPage.jsx': `import React from 'react';
import BloodCompatibilityTable from '../components/BloodCompatibilityTable';

export default function BloodCompatibilityPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Blood Group Compatibility Guide</h2>
      <BloodCompatibilityTable />
    </div>
  );
}
`,

  'src/pages/LoginPage.jsx': `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError("Login failed. Check your email and password.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', background: '#fff' }}>
      <h2>Login to Account</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div><label>Email Address:</label><br /><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
        <div style={{ marginTop: '10px' }}><label>Password:</label><br /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#0275d8', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ fontSize: '13px', marginTop: '15px' }}>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}
`,

  'src/pages/RegisterPage.jsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLOOD_GROUPS } from '../utils/bloodUtils';

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', city: '', address: '',
    bloodGroup: 'O+', dateOfBirth: '', height: '170', weight: '70', emergencyContact: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData.email, formData.password, role, formData);
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', background: '#fff' }}>
      <h2>User Registration</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>Account Type:</label>{' '}
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="DONOR">Donor</option>
          <option value="RECIPIENT">Recipient</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div><label>Full Name:</label><input type="text" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} required style={{ width: '100%' }} /></div>
        <div><label>Email:</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required style={{ width: '100%' }} /></div>
        <div><label>Password:</label><input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required style={{ width: '100%' }} /></div>
        <div><label>Phone:</label><input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} required style={{ width: '100%' }} /></div>
        <div><label>City:</label><input type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} required style={{ width: '100%' }} /></div>

        {role === 'DONOR' && (
          <>
            <div><label>Blood Group:</label>
              <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} style={{ width: '100%' }}>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div><label>Date of Birth:</label><input type="date" value={formData.dateOfBirth} onChange={e=>setFormData({...formData, dateOfBirth: e.target.value})} required style={{ width: '100%' }} /></div>
          </>
        )}

        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Complete Registration
        </button>
      </form>
    </div>
  );
}
`,

  'src/pages/RegisterHospitalPage.jsx': `import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs, doc, setDoc, updateDoc, createUserWithEmailAndPassword, auth } from '../utils/firebase';

export default function RegisterHospitalPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      if (!token) { setLoading(false); return; }
      const q = query(collection(db, 'hospitalInvitations'), where('token', '==', token), where('status', '==', 'Pending'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setInvitation({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
    }
    verifyToken();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
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
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Verifying Invitation Token...</div>;
  if (!invitation) return <div style={{ padding: '20px' }}>Invalid or Expired Invitation Token.</div>;

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', background: '#fff' }}>
      <h2>Complete Hospital Registration</h2>
      <p><strong>Hospital Name:</strong> {invitation.hospitalName}</p>
      <form onSubmit={handleRegister}>
        <div><label>Set Password:</label><br /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6" style={{ width: '100%', padding: '8px' }} /></div>
        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Register Hospital Account</button>
      </form>
    </div>
  );
}
`,

  'src/pages/admin/AdminDashboard.jsx': `import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, doc } from '../../utils/firebase';
import AdminDonorMatching from './AdminDonorMatching';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitals, setHospitals] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [selectedEmergencyReq, setSelectedEmergencyReq] = useState(null);
  const [invForm, setInvForm] = useState({ hospitalName: '', email: '', phone: '', city: '' });

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
    const token = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'hospitalInvitations'), {
      ...invForm, token, status: 'Pending', createdAt: new Date().toISOString()
    });
    alert(\`Invitation Link Generated:\\n /register-hospital?token=\${token}\`);
    setInvForm({ hospitalName: '', email: '', phone: '', city: '' });
    loadAdminData();
  };

  const handleApproveHosp = async (id) => {
    await updateDoc(doc(db, 'hospitals', id), { status: 'Approved' });
    alert('Hospital Approved!');
    loadAdminData();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Control Dashboard</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['overview', 'hospitals', 'invitations', 'emergency'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 15px', background: activeTab === tab ? '#333' : '#eee', color: activeTab === tab ? '#fff' : '#000', border: 'none', cursor: 'pointer' }}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>Total Hospitals: <strong>{hospitals.length}</strong></div>
          <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>Pending Invitations: <strong>{invitations.filter(i=>i.status==='Pending').length}</strong></div>
          <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>Emergency Requests: <strong>{emergencyRequests.length}</strong></div>
        </div>
      )}

      {activeTab === 'hospitals' && (
        <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
          <thead><tr style={{ background: '#eee' }}><th>Hospital</th><th>City</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {hospitals.map(h => (
              <tr key={h.id}>
                <td>{h.name}</td><td>{h.city}</td><td>{h.status}</td>
                <td>{h.status === 'Pending' && <button onClick={() => handleApproveHosp(h.id)}>Approve</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'invitations' && (
        <div>
          <form onSubmit={handleSendInvite} style={{ border: '1px solid #ccc', padding: '15px', maxWidth: '400px', background: '#fff', marginBottom: '20px' }}>
            <h4>Invite New Hospital</h4>
            <div><label>Name:</label><input type="text" value={invForm.hospitalName} onChange={e=>setInvForm({...invForm, hospitalName: e.target.value})} required style={{ width: '100%' }} /></div>
            <div><label>Email:</label><input type="email" value={invForm.email} onChange={e=>setInvForm({...invForm, email: e.target.value})} required style={{ width: '100%' }} /></div>
            <div><label>Phone:</label><input type="text" value={invForm.phone} onChange={e=>setInvForm({...invForm, phone: e.target.value})} required style={{ width: '100%' }} /></div>
            <div><label>City:</label><input type="text" value={invForm.city} onChange={e=>setInvForm({...invForm, city: e.target.value})} required style={{ width: '100%' }} /></div>
            <button type="submit" style={{ marginTop: '10px', padding: '8px 15px', background: '#0275d8', color: '#fff', border: 'none', cursor: 'pointer' }}>Send Invitation</button>
          </form>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div>
          <h3>Emergency Blood Requests</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
            <thead><tr style={{ background: '#eee' }}><th>Blood Group</th><th>Units</th><th>Urgency</th><th>Action</th></tr></thead>
            <tbody>
              {emergencyRequests.map(er => (
                <tr key={er.id}>
                  <td><strong>{er.bloodGroup}</strong></td><td>{er.unitsRequired}</td><td>{er.urgency}</td>
                  <td><button onClick={() => setSelectedEmergencyReq(er)} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>FIND DONORS</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedEmergencyReq && <AdminDonorMatching emergencyRequest={selectedEmergencyReq} />}
        </div>
      )}
    </div>
  );
}
`,

  'src/pages/admin/AdminDonorMatching.jsx': `import React, { useState, useEffect } from 'react';
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
      message: \`Emergency blood group \${emergencyRequest.bloodGroup} requested!\`,
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
`,

  'src/pages/hospital/HospitalDashboard.jsx': `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from '../../utils/firebase';
import { getBagExpirationStatus, BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/bloodUtils';

export default function HospitalDashboard() {
  const { userProfile } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [newBag, setNewBag] = useState({ bloodBagId: '', bloodGroup: 'O+', component: 'Packed RBC', expirationDate: '' });

  useEffect(() => {
    if (userProfile?.userId) {
      loadData();
    }
  }, [userProfile]);

  async function loadData() {
    const hSnap = await getDoc(doc(db, 'hospitals', userProfile.userId));
    if (hSnap.exists()) {
      setLat(hSnap.data().latitude || '');
      setLng(hSnap.data().longitude || '');
    }

    const q = query(collection(db, 'bloodInventory'), where('hospitalId', '==', userProfile.userId));
    const invSnap = await getDocs(q);
    setInventory(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  const handleSaveLocation = async () => {
    await updateDoc(doc(db, 'hospitals', userProfile.userId), { latitude: parseFloat(lat), longitude: parseFloat(lng) });
    alert('Location coordinates saved!');
  };

  const handleAddBag = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'bloodInventory'), {
      ...newBag, hospitalId: userProfile.userId, status: 'AVAILABLE', createdAt: new Date().toISOString()
    });
    alert('Blood Bag added!');
    loadData();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Hospital Inventory Portal</h2>
      <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff', marginBottom: '20px' }}>
        <h4>Set Location Coordinates</h4>
        Lat: <input type="number" step="any" value={lat} onChange={e=>setLat(e.target.value)} />{' '}
        Lng: <input type="number" step="any" value={lng} onChange={e=>setLng(e.target.value)} />{' '}
        <button onClick={handleSaveLocation}>Save Coordinates</button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff', marginBottom: '20px' }}>
        <h4>Add Blood Bag</h4>
        <form onSubmit={handleAddBag} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <input type="text" placeholder="Bag ID" value={newBag.bloodBagId} onChange={e=>setNewBag({...newBag, bloodBagId: e.target.value})} required />
          <select value={newBag.bloodGroup} onChange={e=>setNewBag({...newBag, bloodGroup: e.target.value})}>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <select value={newBag.component} onChange={e=>setNewBag({...newBag, component: e.target.value})}>
            {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={newBag.expirationDate} onChange={e=>setNewBag({...newBag, expirationDate: e.target.value})} required />
          <button type="submit" style={{ gridColumn: 'span 3', padding: '8px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Add to Inventory</button>
        </form>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
        <h4>Current Inventory</h4>
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead><tr style={{ background: '#eee' }}><th>Bag ID</th><th>Group</th><th>Component</th><th>Expiration</th><th>Status</th></tr></thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td>{i.bloodBagId}</td><td><strong>{i.bloodGroup}</strong></td><td>{i.component}</td><td>{i.expirationDate}</td><td>{getBagExpirationStatus(i.expirationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,

  'src/pages/donor/DonorDashboard.jsx': `import React, { useState } from 'react';
import DonorQuestionnaire from '../../components/DonorQuestionnaire';
import BloodCompatibilityTable from '../../components/BloodCompatibilityTable';

export default function DonorDashboard() {
  const [tab, setTab] = useState('intro');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Donor Portal</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('intro')}>Intro</button>
        <button onClick={() => setTab('compatibility')}>Blood Compatibility</button>
        <button onClick={() => setTab('questionnaire')}>Pre-screening</button>
      </div>

      {tab === 'intro' && (
        <div style={{ border: '1px solid #ccc', padding: '20px', background: '#fff' }}>
          <h3>Why Become a Donor?</h3>
          <p>Regular voluntary donations maintain crucial emergency inventories for trauma victims and surgeries.</p>
        </div>
      )}

      {tab === 'compatibility' && <BloodCompatibilityTable />}
      {tab === 'questionnaire' && <DonorQuestionnaire />}
    </div>
  );
}
`,

  'src/pages/recipient/FindBlood.jsx': `import React, { useState } from 'react';
import { db, collection, getDocs } from '../../utils/firebase';
import { BLOOD_GROUPS, BLOOD_COMPONENTS, getBagExpirationStatus } from '../../utils/bloodUtils';

export default function FindBlood() {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Packed RBC');
  const [results, setResults] = useState([]);

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
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Find Blood Inventory</h2>
      <form onSubmit={handleSearch} style={{ border: '1px solid #ccc', padding: '15px', background: '#fff', marginBottom: '20px' }}>
        <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)}>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>{' '}
        <select value={component} onChange={e=>setComponent(e.target.value)}>
          {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>{' '}
        <button type="submit">Search</button>
      </form>

      {results.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
          <thead><tr style={{ background: '#eee' }}><th>Bag ID</th><th>Group</th><th>Component</th><th>Expiration</th></tr></thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td>{r.bloodBagId}</td><td>{r.bloodGroup}</td><td>{r.component}</td><td>{r.expirationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
`,

  'src/pages/recipient/RecipientEmergency.jsx': `import React, { useState } from 'react';
import { db, collection, addDoc } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/bloodUtils';

export default function RecipientEmergency() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ bloodGroup: 'O+', component: 'Packed RBC', unitsRequired: 1, urgency: 'CRITICAL', contactNumber: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqRef = await addDoc(collection(db, 'bloodRequests'), {
      requesterId: currentUser?.uid || 'GUEST', ...formData, status: 'PENDING', createdAt: new Date().toISOString()
    });

    await addDoc(collection(db, 'emergencyRequests'), {
      bloodRequestId: reqRef.id, ...formData, status: 'PENDING', createdAt: new Date().toISOString()
    });

    setSubmitted(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Emergency Blood Request</h2>
      {submitted ? (
        <div style={{ background: '#d4edda', padding: '15px' }}>Request sent to Admin for immediate donor matching!</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
          <div><label>Blood Group:</label><br />
            <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} style={{ width: '100%' }}>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div style={{ marginTop: '10px' }}><label>Units Needed:</label><br />
            <input type="number" min="1" value={formData.unitsRequired} onChange={e=>setFormData({...formData, unitsRequired: e.target.value})} style={{ width: '100%' }} required />
          </div>
          <div style={{ marginTop: '10px' }}><label>Emergency Contact Phone:</label><br />
            <input type="tel" value={formData.contactNumber} onChange={e=>setFormData({...formData, contactNumber: e.target.value})} style={{ width: '100%' }} required />
          </div>
          <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer' }}>Submit Emergency Request</button>
        </form>
      )}
    </div>
  );
}
`,

  'src/App.jsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import BloodCompatibilityPage from './pages/BloodCompatibilityPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterHospitalPage from './pages/RegisterHospitalPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import DonorDashboard from './pages/donor/DonorDashboard';
import FindBlood from './pages/recipient/FindBlood';
import RecipientEmergency from './pages/recipient/RecipientEmergency';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/compatibility" element={<BloodCompatibilityPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register-hospital" element={<RegisterHospitalPage />} />
                <Route path="/find-blood" element={<FindBlood />} />
                <Route path="/emergency-request" element={<RecipientEmergency />} />
                <Route path="/donor-intro" element={<DonorDashboard />} />

                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleRoute>
                  </ProtectedRoute>
                } />

                <Route path="/hospital/*" element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></RoleRoute>
                  </ProtectedRoute>
                } />

                <Route path="/donor/*" element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['DONOR']}><DonorDashboard /></RoleRoute>
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
`
};

// 3. Execution Logic
console.log('Building Emergency Blood Donation Web Application files...');

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

Object.keys(files).forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, files[filePath], 'utf8');
  console.log(`Created: ${filePath}`);
});
