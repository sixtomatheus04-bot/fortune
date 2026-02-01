const googleTrends = require('google-trends-api');

export default async function handler(req, res) {
  try {
    // 1. Busca tendências diárias no Brasil
    const results = await googleTrends.dailyTrends({
      geo: 'BR',
    });

    const data = JSON.parse(results);
    const trendingTopics = data.default.trendingSearchesDays[0].trendingSearches.map(item => ({
      tema: item.title.query,
      volume: item.formattedTraffic,
      noticiaRelacionada: item.articles[0]?.title
    }));

    // 2. Aqui você enviaria 'trendingTopics' para a API do Gemini
    // para gerar legendas e hashtags.

    return res.status(200).json({
      sucesso: true,
      data: trendingTopics
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
