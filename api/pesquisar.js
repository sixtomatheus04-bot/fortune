const googleTrends = require('google-trends-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa a IA (Coloque sua chave nas variáveis de ambiente do Vercel)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  try {
    // 1. Pega os temas do Google Trends
    const results = await googleTrends.dailyTrends({ geo: 'BR' });
    const data = JSON.parse(results);
    const topTema = data.default.trendingSearchesDays[0].trendingSearches[0].title.query;

    // 2. Chama o Gemini para criar o conteúdo viral
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Crie um roteiro de 30 segundos para um vídeo de Instagram Reels/TikTok sobre o tema: "${topTema}". 
    Inclua uma legenda chamativa e 5 hashtags virais. Responda em formato JSON com as chaves: roteiro, legenda, hashtags.`;

    const result = await model.generateContent(prompt);
    const responseIA = JSON.parse(result.response.text().replace(/```json|```/g, ""));

    return res.status(200).json({
      tema: topTema,
      conteudo: responseIA
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
