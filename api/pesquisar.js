const googleTrends = require('google-trends-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  try {
    // Busca tendências no Brasil
    const results = await googleTrends.dailyTrends({ geo: 'BR' });
    const data = JSON.parse(results);
    
    // Pega os 3 temas principais
    const trends = data.default.trendingSearchesDays[0].trendingSearches.slice(0, 3).map(t => t.title.query);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Crie uma legenda viral e 5 hashtags para um Reels sobre: ${trends[0]}. Responda apenas o JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();

    return res.status(200).json({
      tema: trends[0],
      ia_sugestao: JSON.parse(text)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
