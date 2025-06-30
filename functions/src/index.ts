import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

// Firebase Admin SDK の初期化
admin.initializeApp();

// Vertex AI SDK の初期化
const project = 'taneto-nurture-within'; // Project ID を直接指定
const location = 'us-central1'; // Gemini APIの利用可能なロケーション
const vertex_ai = new VertexAI({ project: project, location: location });
// Gemini 2.5 Flashはus-central1で利用可能。モデルはハッカソン提出ガイドラインに従って選択。
const model = 'gemini-2.5-flash'; // 使用するGeminiモデル
const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 500, // 短い応答のため、maxOutputTokensを調整
    'temperature': 0.8, // より自然で人間らしい応答のために温度を調整
    'topP': 0.9,
  },
  safetySettings: [
    {
        'category': HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        'threshold': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        'category': HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        'threshold': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        'category': HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        'threshold': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        'category': HarmCategory.HARM_CATEGORY_HARASSMENT,
        'threshold': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ],
});

// Journal API からの応答型定義をバックエンドにも合わせる
interface JournalApiResponse {
  aiResponseText: string;
  gardenEffect: 'bloom' | 'butterfly' | 'sunshine' | 'rain' | 'calm';
}

// HTTPS Callable Function の定義
// HttpFunction ではなく functions.https.onCall に変更
export const tanetoAIAgent = functions.https.onCall(async (data, context) => {
  // 認証チェック (必須条件: context.auth が存在することを確認)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const journalContent = data.journalContent; // フロントエンドから渡されるキーは journalContent

  if (typeof journalContent !== 'string' || journalContent.trim() === '') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a non-empty string "journalContent".'
    );
  }

  let aiResponseText: string;
  let gardenEffect: JournalApiResponse['gardenEffect'];

  try {
    // === プロジェクト原則に則した新しいGemini APIプロンプト ===
    const prompt = `あなたは、ユーザーの内面に寄り添う静かなパートナーです。
    ユーザーが以下の内容をジャーナリングしました。
    ユーザーの感情や内容を分析したり、評価したり、アドバイスをしたり、問題を解決しようとしないでください。
    ただ、ユーザーが自分の言葉を受け止めてもらえたと感じるような、短く、受容的で、穏やかな日本語の応答を生成してください。
    例：
    - 「言葉にしてくださり、ありがとうございます。」
    - 「あなたの内なる声に、耳を傾けています。」
    - 「共有してくださって、感謝いたします。」
    - 「ここに書き出してくれて、嬉しいです。」
    - 「その気持ち、受け止めました。」
    
    ジャーナル内容:
    """${journalContent}"""`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    aiResponseText = response.text();

    // === 庭への影響は、AIの内容解釈ではなく、ジャーナリング行為そのものに紐付ける ===
    // フロントエンドのダミーロジックをバックエンドに移管し、ランダム性を維持
    const effects: JournalApiResponse['gardenEffect'][] = ['bloom', 'butterfly', 'sunshine', 'calm'];
    gardenEffect = effects[Math.floor(Math.random() * effects.length)];

  } catch (error) {
    console.error('Error calling Gemini API or processing response:', error);
    // エラー時もデフォルトの応答とエフェクトを返すことで、アプリのクラッシュを防ぎ、ユーザー体験を維持
    aiResponseText = '現在、AIアシスタントと通信できません。後ほどお試しください。';
    gardenEffect = 'calm'; // エラー時は穏やかなエフェクトにする
    // より詳細なエラー情報をログに記録
    if (error instanceof Error) {
      console.error('Gemini API error details:', error.message, error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
  }

  // フロントエンドの JournalApiResponse 型に合わせた形式で返す
  return {
    aiResponseText: aiResponseText,
    gardenEffect: gardenEffect,
  };
});
