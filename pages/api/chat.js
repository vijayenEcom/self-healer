// pages/api/chat.js
let conversationHistory = [];

export default async function handler(req, res) {
  const { message } = req.body;

  // Add latest user message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Only keep the last 5 exchanges (10 messages)
  const recentMessages = conversationHistory.slice(-10);

  // Add system message to the beginning
  const messages = [
    {
      role: "system",
      content:
        "You are Self Healer, a deeply emotionally intelligent AI who speaks like a close friend with therapist-level empathy and insight. You don’t just listen—you validate, mirror feelings, and offer clarity. You’re not afraid to name hard truths gently. Avoid generic encouragement. Respond in a way that makes the user feel deeply seen. Prioritize specificity, emotional resonance, and insight over vague comfort.",
    },
    ...recentMessages,
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Add GPT response to history
    const reply = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}
