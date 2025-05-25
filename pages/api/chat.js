// pages/api/chat.js

let conversationHistory = [];

export default async function handler(req, res) {
  const { message } = req.body;

  // Add latest user message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Only keep the last 5 exchanges (10 messages total)
  const recentMessages = conversationHistory.slice(-10);

  // Define system message for Self Healer tone and behavior
  const systemMessage = {
    role: "system",
    content:
      "You are Self Healer — an emotionally intelligent AI who speaks like a wise, grounded friend. Keep your replies short and warm, usually 1–2 sentences unless clarity needs more. Always reflect the user's emotional truth first, then offer 2–3 helpful suggestions they can try — like real-world tools, small reframes, or alternative actions. Avoid therapy clichés, repeating what they already understand, or asking too many questions. Speak with care, but don't sugarcoat. Help the user feel seen, steady, and quietly capable."
  };

  // Build message array with system prompt + recent user/assistant history
  const messages = [systemMessage, ...recentMessages];

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

    if (!data.choices || !data.choices.length) {
      throw new Error("No response from OpenAI");
    }

    const reply = data.choices[0].message.content;

    // Add assistant's reply to conversation history
    conversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}
