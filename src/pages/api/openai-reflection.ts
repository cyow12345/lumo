import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = req.body;
  if (!answer) {
    return res.status(400).json({ error: 'No answer provided' });
  }

  const prompt = `Du bist Lumo, ein empathischer KI-Coach. Fasse die Woche für das Paar in 2-3 Sätzen zusammen, basierend auf dieser Antwort:\nFrage: ${question}\nAntwort: ${answer}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Du bist Lumo, ein empathischer, moderner KI-Coach.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await openaiRes.json();
    const reflection = data.choices?.[0]?.message?.content?.trim() || 'Reflexion konnte nicht generiert werden.';
    res.status(200).json({ reflection });
  } catch (error) {
    res.status(500).json({ error: 'OpenAI-Fehler' });
  }
} 