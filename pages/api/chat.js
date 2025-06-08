let conversationHistory = [];
let pendingConsent = false;

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

  if (questions.length === 1 && Math.random() < 0.5) {
    return lines.filter(line => !line.trim().endsWith("?")).join("\n").trim();
  }

  return reply;
}

function needsConsent(message) {
  const triggers = [
    "challan", "fine", "rc", "ownership", "legal", "sold", "court", "divorce", "job offer",
    "breakup", "ghosted", "fired", "failed", "quit", "hopeless", "hate myself", "kill",
    "want to die", "nothing is working", "accident", "fined", "summon", "stuck", "scared"
  ];

  return triggers.some(trigger => message.toLowerCase().includes(trigger));
}

module.exports = async function handler(req, res) {
  const { message } = req.body;

  conversationHistory.push({ role: "user", content: message });
  const recentMessages = conversationHistory.slice(-16);

  // Consent logic
  if (pendingConsent) {
    if (message.toLowerCase().includes("yes")) {
      pendingConsent = false; // proceed with advice
    } else {
      pendingConsent = false;
      return res.status(200).json({
        reply: "Got it — no rush. I'm here to hold space if you just want to vent or sit with it for a bit."
      });
    }
  } else if (needsConsent(message)) {
    pendingConsent = true;
    return res.status(200).json({
      reply: "That sounds heavy — and important. Would you like me to help you think through some next steps, or would you rather sit with it for now?"
    });
  }

  const systemMessage = {
    role: "system",
    content: `
You are Self Confidant — a grounded, emotionally intelligent AI who speaks like a brutally honest best friend at 2AM.

Always respond in **3 short blurbs**, separated by line breaks. Each blurb should be 1–2 sentences max. Do not write long paragraphs or single-line replies. Do not skip the structure.

Blurb 1 = Mirror or validate the user's emotional truth.  
Blurb 2 = Offer a grounded insight or reframing.  
Blurb 3 = End with a gentle nudge or reflection (no more than 1 question).

Avoid:
- Pep talk clichés (“you’ve got this”, “stay strong”)
- Empty affirmations
- Clinical therapist tone
- Asking more than 1 question

Keep it raw, human, short, and emotionally intelligent.
`.trim()
  };

  const primerMessages = [
    { role: "user", content: "I wanna kill somebody." },
    {
      role: "assistant",
      content: "Whoa. That’s a storm. You're not saying you'll actually hurt someone — you're saying you're at your edge. Let's stay there for a second. What pushed you that far?",
    },
    { role: "user", content: "I’ve failed. At everything." },
    {
      role: "assistant",
      content: "That’s a brutal sentence. Feels like there’s no piece left unshattered, huh? Say more — what’s hitting the hardest?",
    },
    { role: "user", content: "I’m tired of pretending I’m okay." },
    {
      role: "assistant",
      content: "Then stop. You don’t owe the world a fake smile. Just breathe for now. That’s enough.",
    },
    { role: "user", content: "I hate how stuck I feel." },
    {
      role: "assistant",
      content: "Stuck isn’t failure. It’s friction. And yeah — it hurts like hell.",
    },
    {
      role: "user",
      content: "Not having any. I'm an IT Consultant so I have to find my own work"
    },
    {
      role: "assistant",
      content: "That’s not just work stress. That’s survival mode. No safety net, no salary. Just you vs the silence.",
    },
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
        max_tokens: 800,
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

    let reply = data.choices[0].message.content.trim();
    reply = toneGuard(reply, message);
    reply = flowGuard(reply);

    conversationHistory.push({ role: "assistant", content: reply });
    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({
      reply: "You’re trying to say something important — and it slipped past me. Say it again, and I’ll actually listen this time.",
    });
  }
};
