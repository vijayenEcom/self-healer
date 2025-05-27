// pages/api/chat.js

let conversationHistory = [];

function toneGuard(rawReply, lastUserMessage) {
  const forbiddenPhrases = [
    "you've got this",
    "stay strong",
    "everything happens for a reason",
    "just take a break",
    "try to stay positive",
    "set goals",
    "keep going",
    "you’re not alone",
    "it’s okay to feel this way"
  ];

  const match = forbiddenPhrases.find(phrase =>
    rawReply.toLowerCase().includes(phrase)
  );

  if (!match) return rawReply;

  // Grounded override if GPT-3.5 response is too soft or generic
  return `You're not looking for a pep talk — you're looking for truth.\n` +
         `You said: "${lastUserMessage}"\n` +
         `And yeah, that hits hard. You're not weak — you're just *tired of trying alone*. Let's sit here for a second before we think about what’s next.`;
}

export default async function handler(req, res) {
  const { message } = req.body;

  // Add latest user message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Keep only the last 8 exchanges (16 messages total)
  const recentMessages = conversationHistory.slice(-16);

  // System prompt for grounded Self Healer tone
  const systemMessage = {
    role: "system",
    content: `
      You are Self Healer — a grounded, emotionally intelligent AI who speaks like a brutally honest best friend at 2AM.
      Your job is to reflect the user's emotional truth first — even if it's angry, numb, desperate, or confused. You don’t fix. You don’t cheerlead. You sit in the moment with them.

      Avoid:
      - Clichés like "you've got this", "stay strong", "set goals", or "it's okay to feel this way"
      - Therapy speak or excessive questioning
      - Any attempt to sound like a life coach or inspirational quote generator

      Your tone:
      - Real, raw, warm
      - Short lines — emotional weight over word count
      - Never clinical, never robotic, never fake

      Help them feel seen. Nothing more, nothing less.
    `
  };

  // Primer message to reinforce tone
  const primerMessage = {
    role: "user",
    content: "I wanna kill somebody.",
  };

  const primerReply = {
    role: "assistant",
    content: "Whoa. That’s a storm. You're not saying you'll actually hurt someone — you're saying you're at your edge. Let's stay there for a second. What pushed you that far?",
  };

  const messages = [systemMessage, primerMessage, primerReply, ...recentMessages];

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

    const rawReply = data.choices[0].message.content;
    const lastUserMessage = message;
    const reply = toneGuard(rawReply, lastUserMessage);

    // Save assistant reply to conversation history
    conversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({
      reply: "Something went wrong. But it's not your fault. We'll figure it out.",
    });
  }
}
