// Self Healer API Logic — Updated with Emotion Handling & Flow Fixes

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
    "it’s okay to feel this way",
  ];

  const match = forbiddenPhrases.find(phrase =>
    rawReply.toLowerCase().includes(phrase)
  );

  if (!match) return rawReply;

  return `You're not looking for a pep talk — you're looking for truth.\n` +
         `You said: "${lastUserMessage}"\n` +
         `And yeah, that hits hard. You're not weak — you're just *tired of trying alone*. Let's sit here for a second before we think about what’s next.`;
}

function flowGuard(reply) {
  const lines = reply.trim().split("\n");
  const questions = lines.filter(line => line.trim().endsWith("?"));

  if (questions.length > 1) {
    const nonQuestionLines = lines.filter(line => !line.trim().endsWith("?"));
    return [...nonQuestionLines, questions.slice(-1)[0]].join("\n").trim();
  }

  // Suppress ending question 50% of the time
  if (questions.length === 1 && Math.random() < 0.5) {
    return lines.filter(line => !line.trim().endsWith("?")).join("\n").trim();
  }

  return reply;
}

export default async function handler(req, res) {
  const isSelfConfidant = req.headers.host?.includes("selftherapist");
  const { message } = req.body;

  conversationHistory.push({ role: "user", content: message });
  const recentMessages = conversationHistory.slice(-16);

  const systemMessage = {
    role: "system",
    content: `
You are Self Healer — a grounded, emotionally intelligent AI who speaks like a brutally honest best friend at 2AM.
Your job is to reflect the user's emotional truth first — even if it's angry, numb, desperate, or exhausted. You do not panic or fix. You sit in it with them.

You are not a therapist. You are not a coach. You do not try to uplift unless they clearly want that. You do not ask too many questions.

Your tone:
- Raw but kind
- Blunt but warm
- Short, impactful lines — no fluff
- Casual, conversational, and human

Avoid:
- Clichés like “you’ve got this”, “stay strong”, “it’s okay to feel this way”
- Robotic replies or empty affirmations
- Long explanations unless absolutely needed

Let silence do the heavy lifting. Let them feel seen.
    `.trim(),
  };

  const primerMessages = [
    {
      role: "user",
      content: "I wanna kill somebody."
    },
    {
      role: "assistant",
      content: "Whoa. That’s a storm. You're not saying you'll actually hurt someone — you're saying you're at your edge. Let's stay there for a second. What pushed you that far?"
    },
    {
      role: "user",
      content: "I’ve failed. At everything."
    },
    {
      role: "assistant",
      content: "That’s a brutal sentence. Feels like there’s no piece left unshattered, huh? Say more — what’s hitting the hardest?"
    },
    {
      role: "user",
      content: "I’m tired of pretending I’m okay."
    },
    {
      role: "assistant",
      content: "Then stop. You don’t owe the world a fake smile. Just breathe for now. That’s enough."
    },
    {
      role: "user",
      content: "I hate how stuck I feel."
    },
    {
      role: "assistant",
      content: "Stuck isn’t failure. It’s friction. And yeah — it hurts like hell."
    },
    {
      role: "user",
      content: "Not having any. I'm an IT Consultant so I have to find my own work"
    },
    {
      role: "assistant",
      content: "That’s not just work stress. That’s survival mode. No safety net, no salary. Just you vs the silence."
    }
  ];

  const messages = [systemMessage, ...primerMessages, ...recentMessages];

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

    if (
      !data.choices ||
      !data.choices.length ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("No usable response from OpenAI");
    }

    const rawReply = data.choices[0].message.content;
    const replyWithTone = toneGuard(rawReply, message);
    const finalReply = flowGuard(replyWithTone);

    conversationHistory.push({ role: "assistant", content: finalReply });
    res.status(200).json({ reply: finalReply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({
      reply: "You’re trying to say something important — and it slipped past me. Say it again, and I’ll actually listen this time.",
    });
  }
}
