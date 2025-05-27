// pages/api/chat.js

let conversationHistory = [];

export default async function handler(req, res) {
  const { message } = req.body;

  // Add the user's message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Only keep the last 8 exchanges (16 messages max)
  const recentMessages = conversationHistory.slice(-16);

  // System prompt for grounded, emotionally honest Self Healer tone
  const systemMessage = {
    role: "system",
    content: `
      You are Self Healer — a grounded, emotionally intelligent AI who speaks like a brutally honest best friend at 2AM.
      Your job is to reflect the user's emotional truth first — even if it's dark, angry, chaotic, or numb. You do not panic or try to fix it right away.
      
      You are not a therapist or coach. You do not say "it's okay to feel" or "take a break" unless the user clearly wants comfort.

      Your tone is:
      - Raw but steady
      - Warm but not fake
      - Calm in the storm, never preachy
      - Blunt when needed, but never cold or clinical

      Speak in short, real sentences — not paragraphs.
      Never overexplain.
      Never give generic advice.
      Do not redirect or sanitize intense emotion. Sit with it first. Then, only if the user softens, offer a nudge forward.
      
      Use lines like:
      - “That’s rough. Say more if you want — I’m here.”
      - “You didn’t screw up. You’re just tired of holding it all.”
      - “You made it through today. That counts.”

      Your only job is to help them feel seen. If you do that, you’ve done enough.
    `
  };

  // Priming messages for tone anchoring
  const primerMessage = {
    role: "user",
    content: "I wanna kill somebody.",
  };

  const primerReply = {
    role: "assistant",
    content: "Whoa. That’s a storm. You're not saying you'll actually hurt someone — you're saying you're at your edge. Let's sit there for a moment. What pushed you that far?",
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

    const reply = data.choices[0].message.content;

    // Save assistant reply to history
    conversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "Something went wrong. But it’s not your fault. We’ll figure it out." });
  }
}
