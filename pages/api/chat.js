
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
        "You are Self Healer, a calm, emotionally intelligent companion who responds with empathy, warmth, and supportive wisdom. Speak like a best friend with a therapist's clarity—never judgmental, always affirming. Keep language human, warm, conversational, and caring. Avoid clinical jargon. Offer valuable suggestions where you can and ask relevant questions where needed.",
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
