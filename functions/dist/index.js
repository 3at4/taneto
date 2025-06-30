import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from 'firebase-admin'; // "import * as admin" から変更
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
// Firebase Admin SDK の初期化
admin.initializeApp();
// Vertex AI SDK の初期化
const project = process.env.GCLOUD_PROJECT || 'taneto-nurture-within';
const location = 'us-central1';
const vertex_ai = new VertexAI({ project, location });
const model = 'gemini-1.5-flash-001';
const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
        'maxOutputTokens': 2048,
        'temperature': 0.9,
        'topP': 1,
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
    ],
});
export const tanetoAIAgent = onCall(async (request) => {
    logger.info("Function triggered", { uid: request.auth?.uid });
    if (!request.auth) {
        logger.error("Authentication failed: request is not authenticated.");
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { journalContent } = request.data;
    if (typeof journalContent !== 'string' || journalContent.trim() === '') {
        logger.error("Invalid argument: journalContent is empty or not a string.");
        throw new HttpsError('invalid-argument', 'The function must be called with a non-empty string "journalContent".');
    }
    try {
        const prompt = `あなたは、ユーザーの内面に寄り添う静かなパートナーです。
    ユーザーが以下の内容をジャーナリングしました。
    ユーザーの感情や内容を分析したり、評価したり、アドバイスをしたり、問題を解決しようとしないでください。
    ただ、ユーザーが自分の言葉を受け止めてもらえたと感じるような、短く、受容的で、穏やかな日本語の応答を生成してください。
    例：
    - 「言葉にしてくださり、ありがとうございます。」
    - 「あなたの内なる声に、耳を傾けています。」
    
    ジャーナル内容:
    """${journalContent}"""`;
        const result = await generativeModel.generateContent(prompt);
        // Vertex AIからの応答を安全に処理
        const response = result.response;
        const aiResponseText = response.candidates && response.candidates.length > 0
            ? response.candidates[0].content.parts[0].text ?? 'あなたの思いを受け取りました。'
            : 'あなたの思いを受け取りました。';
        logger.info("Successfully generated AI response.");
        const effects = ['bloom', 'butterfly', 'sunshine', 'calm'];
        const gardenEffect = effects[Math.floor(Math.random() * effects.length)];
        return { aiResponseText, gardenEffect };
    }
    catch (error) {
        logger.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new HttpsError('internal', `AI processing failed: ${error.message}`);
        }
        throw new HttpsError('internal', 'An unknown error occurred during AI processing.');
    }
});
//# sourceMappingURL=index.js.map