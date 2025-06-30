import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
// Initialize Vertex AI
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'asia-northeast1' });
// Use the specific model version you have access to.
const model = 'gemini-2.5-flash-lite-preview-06-17';
const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
    generationConfig: {
        'maxOutputTokens': 2048,
        'temperature': 0.7,
        'topP': 1,
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
const painCategories = [
    'コントロール喪失感',
    '自己への疑い',
    'パートナーとの温度差',
    'コミュニケーションの壁',
    '静かな罪悪感',
    '役割の不履行感',
    '情報の海での孤立',
    '親密さの変質',
    'ポジティブな報告',
    'その他'
].join(',');
const classifyPrompt = `
あなたは男性の妊活における感情分析の専門家です。以下のジャーナルテキストを読み、最も当てはまる感情カテゴリを一つだけ選んでください。
出力はカテゴリ名のみとし、他のテキストは一切含めないでください。

利用可能なカテゴリ: ${painCategories}

ジャーナルテキスト:
`;
const empathyPrompt = (category, text) => `
あなたは非常に共感能力の高い、男性妊活のカウンセラーです。
ユーザーは今、あなたの分析によると「${category}」という感情を抱えています。
以下のジャーナルテキストを踏まえ、ユーザーの心に深く寄り添う、非常に短く（約60字以内）、優しい応答を生成してください。
ただし、ユーザーの言葉をオウム返しするのではなく、その感情の核心を突くような言葉を選んでください。

ジャーナルテキスト: "${text}"
`;
export const tanetoAIAgent = async (req, res) => {
    // Set CORS headers for preflight requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        const { journalText } = req.body;
        if (!journalText) {
            res.status(400).send({ error: 'journalText is required' });
            return;
        }
        // Step 1: Classify the pain point
        const classifyReq = { contents: [{ role: 'user', parts: [{ text: classifyPrompt + journalText }] }] };
        const classifyResult = await generativeModel.generateContent(classifyReq);
        // Safely access the response
        if (!classifyResult.response || !classifyResult.response.candidates || classifyResult.response.candidates.length === 0) {
            throw new Error("Invalid response from classification model");
        }
        const category = classifyResult.response.candidates[0].content.parts[0].text?.trim() || 'その他';
        // Step 2: Generate empathetic response based on classification
        const empathyReq = { contents: [{ role: 'user', parts: [{ text: empathyPrompt(category, journalText) }] }] };
        const empathyResult = await generativeModel.generateContent(empathyReq);
        // Safely access the response
        if (!empathyResult.response || !empathyResult.response.candidates || empathyResult.response.candidates.length === 0) {
            throw new Error("Invalid response from empathy model");
        }
        const reply = empathyResult.response.candidates[0].content.parts[0].text?.trim() || 'あなたの思いを受け取りました。';
        res.status(200).send({
            reply: reply,
            category: category
        });
    }
    catch (error) {
        console.error('ERROR:', error);
        res.status(500).send({ error: 'AI processing failed.' });
    }
};
//# sourceMappingURL=index.js.map