/**
 * ユーザーのジャーナルを送信し、AIからの応答と庭への影響を受け取るAPIクライアント。
 * Firestoreへの保存とCloud Function呼び出しの全責任を負う。
 */
import { functionsInstance, auth, saveJournalEntryToFirestore } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { JournalEntry } from '@/lib/types';
import { format } from 'date-fns';

export interface JournalApiResponse {
  aiResponseText: string;
  gardenEffect: 'bloom' | 'butterfly' | 'sunshine' | 'rain' | 'calm';
}

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};
  

export async function submitJournal(question: string, content: string): Promise<JournalApiResponse> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("User is not authenticated. Cannot submit journal.");
  }

  console.log(`[Journal API] Submitting entry for user ${user.uid}`);

  const newEntry: Omit<JournalEntry, 'id'> = {
    date: format(new Date(), 'yyyy-MM-dd'),
    question: question,
    content: content,
    createdAt: new Date()
  };

  // 1. Firestoreにジャーナルを保存
  await saveJournalEntryToFirestore(newEntry, user.uid);

  // 2. Cloud Function を呼び出してAIの応答を取得
  if (!functionsInstance) {
    console.error("Firebase Functions instance is not initialized.");
    return {
      aiResponseText: 'システムがまだ準備中です。少し待ってからお試しください。',
      gardenEffect: 'calm',
    };
  }

  try {
    const tanetoAIAgentCallable = httpsCallable(functionsInstance, 'tanetoAIAgent');
    const result = await tanetoAIAgentCallable({ journalContent: content });
    const responseData = result.data as JournalApiResponse;

    if (!responseData || !responseData.aiResponseText || !responseData.gardenEffect) {
      throw new Error('Invalid response format from Cloud Function.');
    }

    return responseData;

  } catch (error) {
    console.error('Error calling Cloud Function:', error);
    return {
      aiResponseText: 'AIアシスタントと通信できませんでした。後ほどお試しください。',
      gardenEffect: 'calm',
    };
  }
}
