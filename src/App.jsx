import React from 'react';
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
import ProfilePage from './pages/ProfilePage';

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
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
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
