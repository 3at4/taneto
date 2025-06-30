/**
 * ユーザーのジャーナルを送信し、AIからの応答と庭への影響を受け取るAPIクライアント。
 */
import { functionsInstance } from '@/lib/firebase'; // functionsInstance をインポート
import { httpsCallable } from 'firebase/functions'; // httpsCallable をインポート

export interface JournalApiResponse {
  aiResponseText: string;
  gardenEffect: 'bloom' | 'butterfly' | 'sunshine' | 'rain' | 'calm'; // 庭への影響の種類を定義
}

export async function submitJournalEntry(entryText: string): Promise<JournalApiResponse> {
  console.log(`[Journal API] Submitting entry: "${entryText}"`);

  if (!functionsInstance) {
    console.error("Firebase Functions instance is not initialized.");
    // 初期化されていない場合は、デフォルトの応答を返す
    return {
      aiResponseText: 'システムがまだ準備中です。少し待ってからお試しください。',
      gardenEffect: 'calm',
    };
  }

  try {
    // tanetoAIAgent Cloud Function を呼び出す
    const tanetoAIAgentCallable = httpsCallable(functionsInstance, 'tanetoAIAgent');
    const result = await tanetoAIAgentCallable({ journalContent: entryText });

    // Cloud Function からの戻り値が正しい型であることを保証
    const responseData = result.data as JournalApiResponse;

    if (!responseData || !responseData.aiResponseText || !responseData.gardenEffect) {
      throw new Error('Invalid response format from Cloud Function.');
    }

    return responseData;

  } catch (error) {
    console.error('Error calling Cloud Function:', error);
    // Cloud Function 呼び出しでエラーが発生した場合のフォールバック
    return {
      aiResponseText: 'AIアシスタントと通信できませんでした。後ほどお試しください。',
      gardenEffect: 'calm', // エラー時は穏やかなエフェクトに設定
    };
  }
}
