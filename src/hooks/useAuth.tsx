import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  signInWithCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load profile from cache first to be resilient to quota issues
        const cachedProfile = localStorage.getItem(`user_profile_${user.uid}`);
        if (cachedProfile) {
          try { setProfile(JSON.parse(cachedProfile)); } catch (e) {}
        }

        const userDocRef = doc(db, 'users', user.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (error) {
          console.warn("Auth: Failed to get user profile (likely quota), using cache", error);
          setLoading(false);
          return;
        }
        
        // Dynamic role detection
        // @ts-ignore
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        // @ts-ignore
        const adminPhone = import.meta.env.VITE_ADMIN_PHONE;
        // @ts-ignore
        const partnerPhone = import.meta.env.VITE_LIMIT_PHONE;

        let detectedRole: 'admin' | 'partner' | 'visitor' = 'visitor';
        if (user.email === adminEmail || user.phoneNumber === adminPhone) {
          detectedRole = 'admin';
        } else if (user.phoneNumber === partnerPhone) {
          detectedRole = 'partner';
        } else if (user.isAnonymous) {
          // For anonymous users, we trust the role already stored in their document
          // if it exists, otherwise it stays as detectedRole (visitor)
        }

        if (userDoc.exists()) {
          const currentProfile = userDoc.data() as UserProfile;
          
          // Only auto-update roles for non-anonymous users (email/phone verified)
          // For anonymous users, we trust what was set during the signInWithCode call
          if (!user.isAnonymous && currentProfile.role !== detectedRole) {
            const updatedProfile = { ...currentProfile, role: detectedRole };
            await setDoc(userDocRef, updatedProfile, { merge: true });
            setProfile(updatedProfile);
            localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(updatedProfile));
          } else {
            setProfile(currentProfile);
            localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(currentProfile));
          }
        } else if (!user.isAnonymous) {
          // Only create default profiles automatically for non-anonymous (email/Google) users
          // Anonymous users have their profile created explicitly in signInWithCode
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: detectedRole
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(newProfile));
        } else {
          // user is anonymous and doc doesn't exist yet
          // we wait for the signInWithCode function to complete its setDoc
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const setupRecaptcha = (containerId: string) => {
    if (!recaptchaVerifier) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn('Recaptcha container not found yet, will retry');
        return;
      }
      try {
        const verifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible'
        });
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error('Failed to initialize recaptcha:', error);
      }
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    if (!recaptchaVerifier) throw new Error('Recaptcha not initialized');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const signInWithCode = async (code: string) => {
    const { ADMIN_CODE, PARTNER_CODE } = await import('../constants');
    
    let role: 'admin' | 'partner' | null = null;

    if (code === ADMIN_CODE) {
      role = 'admin';
    } else if (code === PARTNER_CODE) {
      role = 'partner';
    }

    if (!role) {
      throw new Error('This world is not for you 🤍');
    }

    // Authenticate anonymously
    const { user: anonUser } = await signInAnonymously(auth);
    
    // Create/Update profile with the role
    const profileData: UserProfile = {
      uid: anonUser.uid,
      email: null,
      phoneNumber: null,
      role
    };
    
    await setDoc(doc(db, 'users', anonUser.uid), profileData);
    setProfile(profileData);
    localStorage.setItem(`user_profile_${anonUser.uid}`, JSON.stringify(profileData));
  };



  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, setupRecaptcha, signInWithPhone, signInWithCode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
