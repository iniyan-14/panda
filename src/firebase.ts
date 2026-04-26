import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Using initializeFirestore for more robust settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // This often fixes Internal Assertion errors in dev
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
