import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
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
  setDoc
} from 'firebase/firestore';
import { JournalEntry, DailyLog } from '@/lib/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- Auth Functions ---

export const signUp = (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const signIn = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const logOut = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth }; // Export auth object

// --- Firestore Functions ---

const AI_FUNCTION_URL = process.env.NEXT_PUBLIC_AI_FUNCTION_URL || 'https://your-cloud-function-url';

export async function saveData(content: string, userId: string): Promise<string> {
  if (!userId) throw new Error("User is not authenticated.");
  try {
    const journalEntry = {
      date: new Date().toISOString().split('T')[0],
      content: content,
      createdAt: new Date()
    };
    await addDoc(collection(db, 'users', userId, 'journals'), journalEntry);

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
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() && docSnap.data().onboardingCompleted === true;
};

export const setOnboardingCompleted = async (userId: string): Promise<void> => {
    if (!userId) throw new Error("User is not authenticated.");
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { onboardingCompleted: true }, { merge: true });
};
