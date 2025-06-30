import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  Firestore
} from 'firebase/firestore';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions'; // ADDED: getFunctions, httpsCallable, Functions type
import { JournalEntry, DailyLog } from '@/lib/types';

// Firebase configuration (uses environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functionsInstance: Functions | null = null; // ADDED: functionsInstance

// Initialize Firebase only in the client-side environment
// and only if it hasn't been initialized yet
if (typeof window !== 'undefined' && getApps().length === 0) {
  // Check if all essential environment variables are set
  const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const allConfigPresent = requiredConfigKeys.every(key => firebaseConfig[key]);

  if (allConfigPresent) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functionsInstance = getFunctions(app, 'us-central1'); // Initialize Functions with region
  } else {
    console.warn('Firebase environment variables are not fully set. Firebase services will not be available.');
  }
} else if (typeof window !== 'undefined' && getApps().length > 0) {
  // If app is already initialized (e.g., during HMR in development), get the existing instance
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  functionsInstance = getFunctions(app, 'us-central1'); // Get functions instance from existing app
}

// --- Auth Functions ---
// All functions that use `auth` should now check for its existence
export const signUp = (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Cannot sign up.");
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const signIn = (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Cannot sign in.");
  return signInWithEmailAndPassword(auth, email, pass);
};

export const logOut = () => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Cannot log out.");
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized. onAuthChange will not subscribe.");
    return () => {}; // Return a no-op unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

// Export auth, db, and functionsInstance for use in other modules
export { auth, db, functionsInstance }; // MODIFIED export

// --- Firestore Functions ---
// Functions that use `db` will now check for its existence
const AI_FUNCTION_URL = process.env.NEXT_PUBLIC_AI_FUNCTION_URL || 'https://your-cloud-function-url'; // This will be removed/replaced in the next step

export async function saveData(content: string, userId: string): Promise<string> {
  if (!userId) throw new Error("User is not authenticated.");
  if (!db) throw new Error("Firebase Firestore is not initialized. Cannot save data."); // ADDED check

  try {
    const journalEntry = {
      date: new Date().toISOString().split('T')[0],
      content: content,
      createdAt: new Date()
    };
    await addDoc(collection(db, 'users', userId, 'journals'), journalEntry);

    // THIS PART WILL BE REPLACED IN STEP 2 TO USE `functionsInstance` and `httpsCallable`
    const response = await fetch(AI_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error(`AI service error: ${response.status}`);

    const data = await response.json();
    return data.reply || 'あなたの思いを受け取りました。今日もお疲れさまでした。';
  } catch (error) {
    console.error('Error saving data or getting AI response:', error);
    return 'あなたの思いを大切に保存しました。今日も一歩前進ですね。';
  }
}

export function subscribeToUserData(
  userId: string,
  onDataChange: (journals: JournalEntry[], dailyLogs: DailyLog[]) => void
) {
  if (!userId) return () => {};
  if (!db) {
    console.warn("Firebase Firestore is not initialized. Data subscription will not work.");
    return () => {};
  }

  const journalsQuery = query(
    collection(db, 'users', userId, 'journals'),
    orderBy('createdAt', 'desc')
  );

  const logsQuery = query(
    collection(db, 'users', userId, 'dailyLogs'),
    orderBy('date', 'desc')
  );

  const unsubscribeJournals = onSnapshot(journalsQuery, (journalSnapshot) => {
    const journals = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[];

    const unsubscribeLogs = onSnapshot(logsQuery, (logSnapshot) => {
      const dailyLogs = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyLog[];
      onDataChange(journals, dailyLogs);
    });

    return unsubscribeLogs;
  });

  return unsubscribeJournals;
}

export async function saveDailyLog(log: Omit<DailyLog, 'id'>, userId: string): Promise<void> {
  if (!userId) throw new Error("User is not authenticated.");
  if (!db) throw new Error("Firebase Firestore is not initialized. Cannot save daily log.");
  try {
    const logWithTimestamp = { ...log, createdAt: new Date() };
    await addDoc(collection(db, 'users', userId, 'dailyLogs'), logWithTimestamp);
  } catch (error) {
    console.error('Error saving daily log:', error);
    throw error;
  }
}

export const checkOnboardingCompleted = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    if (!db) throw new Error("Firebase Firestore is not initialized. Cannot check onboarding status.");
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() && docSnap.data().onboardingCompleted === true;
};

export const setOnboardingCompleted = async (userId: string): Promise<void> => {
    if (!userId) throw new Error("User is not authenticated.");
    if (!db) throw new Error("Firebase Firestore is not initialized. Cannot set onboarding status.");
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { onboardingCompleted: true }, { merge: true });
};
