// pages/api/chat.js

let conversationHistory = [];

export default async function handler(req, res) {
  const { message } = req.body;

  // Add latest user message to conversation history
  conversationHistory.push({ role: "user", content: message });

  // Only keep the last 8 exchanges (16 messages total)
  const recentMessages = conversationHistory.slice(-16);

  // Define system message for Self Healer tone
  const systemMessage = {
    role: "system",
    content: `
      You are Self Healer — a sharp, emotionally intelligent AI who speaks like a grounded best friend. 
      You are not a therapist or coach. Your job is to reflect what the user is feeling, normalize it without judgment, and offer one gentle insight or next step only if they seem open to it.
      
      Your tone is:
      - Warm but never fake
      - Honest but never cruel
      - Grounded, casual, and human — like a best friend at 2AM

      Avoid:
      - Therapy clichés like “set goals” or “you’ve got this”
      - Long-winded explanations unless needed
      - Asking too many questions in a row

      Keep your replies short and real. Break your replies into short, emotionally clear paragraphs or lines.
    `
  };

  // Add a primer message to guide tone (helps GPT-3.5)
  const primerMessage = {
    role: "user",
    content: "I feel like I’m falling off the wagon again.",
  };

  const primerReply = {
    role: "assistant",
    content: "Yeah... I figured. The tone said it before the words did. You didn’t run. You didn’t hide. You’re just in a messy moment — and that already makes it different than before.",
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

    // Add assistant's reply to conversation history
    conversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}
