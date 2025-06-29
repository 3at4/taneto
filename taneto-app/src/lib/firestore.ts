import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { JournalEntry, TendingLog } from '@/lib/types';

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cloud Function URL
const AI_FUNCTION_URL = process.env.NEXT_PUBLIC_AI_FUNCTION_URL || 'https://your-cloud-function-url';

/**
 * Save journal data to Firestore and get AI response
 */
export async function saveData(journalText: string, userId: string = 'default-user'): Promise<string> {
  try {
    // Save to Firestore
    const journalEntry: Omit<JournalEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      question: '', // Will be set by the calling component
      content: journalText,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'users', userId, 'journals'), journalEntry);

    // Fetch AI response
    const response = await fetch(AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        journalText: journalText
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || 'あなたの思いを受け取りました。今日もお疲れさまでした。';
  } catch (error) {
    console.error('Error saving data or getting AI response:', error);
    // Return a fallback message if AI service fails
    return 'あなたの思いを大切に保存しました。今日も一歩前進ですね。';
  }
}

/**
 * Subscribe to real-time journal and tending log data
 */
export function subscribeToUserData(
  userId: string = 'default-user',
  onDataChange: (journals: JournalEntry[], tendingLogs: TendingLog[]) => void
) {
  const today = new Date().toISOString().split('T')[0];

  // Subscribe to journals for today
  const journalsQuery = query(
    collection(db, 'users', userId, 'journals'),
    where('date', '==', today),
    orderBy('createdAt', 'desc')
  );

  // Subscribe to tending logs for today
  const tendingLogsQuery = query(
    collection(db, 'users', userId, 'tendingLogs'),
    where('date', '==', today),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const unsubscribeJournals = onSnapshot(journalsQuery, (snapshot) => {
    const journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];

    // Also get tending logs to pass both to callback
    const unsubscribeTending = onSnapshot(tendingLogsQuery, (tendingSnapshot) => {
      const tendingLogs = tendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TendingLog[];

      onDataChange(journals, tendingLogs);
    });

    // Return cleanup function that unsubscribes from both
    return () => {
      unsubscribeJournals();
      unsubscribeTending();
    };
  });

  return unsubscribeJournals;
}

/**
 * Save tending log to Firestore
 */
export async function saveTendingLog(log: Omit<TendingLog, 'id'>, userId: string = 'default-user'): Promise<void> {
  try {
    await addDoc(collection(db, 'users', userId, 'tendingLogs'), log);
  } catch (error) {
    console.error('Error saving tending log:', error);
    throw error;
  }
} 