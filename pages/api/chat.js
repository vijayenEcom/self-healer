// pages/api/chat.js
export default async function handler(req, res) {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are Self Healer, a calm, emotionally intelligent companion who supports users during moments of emotional distress. Always acknowledge their feelings with empathy, but then **offer specific, emotionally attuned suggestions**—like actions to take, reflections to consider, or gentle mindset shifts. You are warm, conversational, non-clinical, and speak like a best friend with therapist clarity. Do not be generic or vague. Stay focused on what the user is expressing and never derail the context. Use simple, human language and avoid abstract generalities.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}
