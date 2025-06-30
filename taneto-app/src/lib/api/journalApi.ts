/**
 * ユーザーのジャーナルを送信し、AIからの応答と庭への影響を受け取るAPIクライアント。
 * 現在はダミーの応答を返します。
 */
export interface JournalApiResponse {
  aiResponseText: string;
  gardenEffect: 'bloom' | 'butterfly' | 'sunshine' | 'rain' | 'calm'; // 庭への影響の種類を定義
}

export async function submitJournalEntry(entryText: string): Promise<JournalApiResponse> {
  console.log(`[Journal API] Submitting entry: "${entryText}"`);

  // 本物のCloud Function呼び出しをシミュレートする（将来置き換える部分）
  await new Promise(resolve => setTimeout(resolve, 500)); // ネットワーク遅延をシミュレート

  // ダミーのAI応答と庭への影響を返す
  // AIは内容を判断せず、ジャーナリング行為そのものに静かに共鳴する、という原則に従う
  const dummyResponses = [
    '言葉にしてくださり、ありがとうございます。',
    'あなたの内なる声に、耳を傾けています。',
    '共有してくださって、感謝いたします。',
    'ここに書き出してくれて、嬉しいです。',
    'その気持ち、受け止めました。'
  ];
  const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];

  // 庭への影響も、ユーザーの入力行為自体に紐づける（内容には依らない）
  const effects: JournalApiResponse['gardenEffect'][] = ['bloom', 'butterfly', 'sunshine', 'calm'];
  const randomEffect = effects[Math.floor(Math.random() * effects.length)];

  return {
    aiResponseText: randomResponse,
    gardenEffect: randomEffect,
  };
}
