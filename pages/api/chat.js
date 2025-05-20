export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Something went wrong.';
    res.status(200).json({ reply });
  } catch {
    res.status(500).json({ error: 'Failed to connect to OpenAI' });
  }
}
