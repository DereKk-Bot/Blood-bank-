import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, 
  doc, getDoc, setDoc, updateDoc 
} from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchUserProfile(uid) {
    if (!db) {
      setUserProfile(null);
      return null;
    }

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
    if (!auth) {
      throw new Error('Authentication is unavailable right now.');
    }

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    const latitude = parseFloat(additionalData.latitude) || 0;
    const longitude = parseFloat(additionalData.longitude) || 0;

    const userData = {
      userId: user.uid,
      name: additionalData.fullName || additionalData.name || '',
      email,
      phone: additionalData.mobileNumber || additionalData.phone || '',
      role,
      city: additionalData.city || '',
      address: additionalData.address || '',
      latitude,
      longitude,
      locationSharedAt: additionalData.locationSharedAt || null,
      createdAt: new Date().toISOString()
    };

    if (role === 'HOSPITAL') {
      userData.inventory = {
        'A+': 0,
        'A-': 0,
        'B+': 0,
        'B-': 0,
        'AB+': 0,
        'AB-': 0,
        'O+': 0,
        'O-': 0
      };
    }

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
        latitude,
        longitude,
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
        latitude,
        longitude,
        createdAt: new Date().toISOString()
      });
    } else if (role === 'HOSPITAL') {
      await setDoc(doc(db, 'hospitals', user.uid), {
        hospitalId: user.uid,
        userId: user.uid,
        name: additionalData.fullName || additionalData.name || '',
        email,
        phone: additionalData.mobileNumber || additionalData.phone || '',
        city: additionalData.city || '',
        address: additionalData.address || '',
        latitude,
        longitude,
        inventory: {
          'A+': 0,
          'A-': 0,
          'B+': 0,
          'B-': 0,
          'AB+': 0,
          'AB-': 0,
          'O+': 0,
          'O-': 0
        },
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
    }

    await fetchUserProfile(user.uid);
    return user;
  }

  async function updateUserProfile(uid, profileData, role = userProfile?.role) {
    if (!db) {
      throw new Error('Database is unavailable right now.');
    }

    const normalizedRole = role || userProfile?.role || 'ADMIN';
    const latitude = profileData.latitude === '' || profileData.latitude == null ? 0 : Number(profileData.latitude);
    const longitude = profileData.longitude === '' || profileData.longitude == null ? 0 : Number(profileData.longitude);

    const updates = {
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      city: profileData.city || '',
      address: profileData.address || '',
      latitude,
      longitude,
      locationSharedAt: profileData.locationSharedAt || null,
      updatedAt: new Date().toISOString()
    };

    if (normalizedRole === 'HOSPITAL' && profileData.inventory) {
      updates.inventory = profileData.inventory;
    }

    await updateDoc(doc(db, 'users', uid), updates);

    if (normalizedRole === 'DONOR') {
      await updateDoc(doc(db, 'donors', uid), {
        city: profileData.city || '',
        address: profileData.address || '',
        latitude,
        longitude,
        bloodGroup: profileData.bloodGroup || '',
        dateOfBirth: profileData.dateOfBirth || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        updatedAt: new Date().toISOString()
      });
    } else if (normalizedRole === 'RECIPIENT') {
      await updateDoc(doc(db, 'recipients', uid), {
        city: profileData.city || '',
        address: profileData.address || '',
        latitude,
        longitude,
        emergencyContact: profileData.emergencyContact || '',
        updatedAt: new Date().toISOString()
      });
    } else if (normalizedRole === 'HOSPITAL') {
      await updateDoc(doc(db, 'hospitals', uid), {
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        address: profileData.address || '',
        latitude,
        longitude,
        inventory: profileData.inventory || {
          'A+': 0,
          'A-': 0,
          'B+': 0,
          'B-': 0,
          'AB+': 0,
          'AB-': 0,
          'O+': 0,
          'O-': 0
        },
        updatedAt: new Date().toISOString()
      });
    }

    const nextProfile = { ...(userProfile || {}), ...updates, role: normalizedRole };
    setUserProfile(nextProfile);
    return nextProfile;
  }

  function login(email, password) {
    if (!auth) {
      return Promise.reject(new Error('Authentication is unavailable right now.'));
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    if (!auth) {
      return Promise.resolve();
    }
    return signOut(auth);
  }

  function resetPassword(email) {
    if (!auth) {
      return Promise.reject(new Error('Authentication is unavailable right now.'));
    }
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      setUserProfile(null);
      setLoading(false);
      return undefined;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          setCurrentUser(user);
          if (user) {
            await fetchUserProfile(user.uid);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Auth state update failed:', error);
          setCurrentUser(null);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Auth subscription failed:', error);
      setCurrentUser(null);
      setUserProfile(null);
      setLoading(false);
      return undefined;
    }
  }, []);

  const value = { currentUser, userProfile, login, registerUser, logout, resetPassword, fetchUserProfile, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
