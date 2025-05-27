// ✅ /pages/index.js (Self Therapist version)

import { useState, useEffect, useRef } from 'react';
import { logEvent } from '../utils/logger';

const isSelfTherapist =
  typeof window !== "undefined" &&
  window.location.hostname.includes("selftherapist");

const appName = isSelfTherapist ? "Self Therapist" : "Self Healer";
const subtitle = isSelfTherapist
  ? "This is your space. Raw, honest, beta-tested truth."
  : "You're the one doing all the work — I'm just here to listen and offer a little perspective.";
const welcomeText = isSelfTherapist
  ? "Welcome to the beta. Say anything. No filter, no fluff."
  : "Welcome. This space is here for you.";

export default function SelfHealer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    logEvent('user_prompt', {
      prompt: input,
      timestamp: Date.now(),
    });

    const userMessage = { type: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const replyChunks = (data.reply || "Sorry, I didn’t quite catch that.")
        .split(/\n{2,}/g)
        .flatMap(para =>
          para.match(/(?:[^.!?]+[.!?]+["']?\s*){1,2}/g) || [para]
        )
        .map(chunk => chunk.trim())
        .filter(Boolean);

      const replyMessages = replyChunks.map(content => ({
        type: 'gpt',
        content,
      }));

      setMessages((prev) => [...prev, ...replyMessages]);
    } catch (err) {
      console.error('API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          type: 'gpt',
          content: `There was an error connecting to ${appName}. Try again soon.`,
        },
      ]);
    }
  };

  const sendFeedback = async (type, reply, messages, comment = "") => {
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user')?.content;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: type,
          message: lastUserMessage || "",
          reply,
          comment,
          timestamp: Date.now()
        }),
      });
      console.log("Feedback sent:", type);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-3xl font-bold text-gray-800">🫂 {appName}</div>
        </div>

        <p className="text-center text-sm text-gray-500 italic mb-2">
          {subtitle}
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-gray-700">
          {welcomeText}
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`rounded-xl px-4 py-2 text-base max-w-prose ${
                  msg.type === 'user' ? 'bg-gray-100 self-end text-right' : 'bg-green-100 self-start text-left'
                } text-gray-800`}
              >
                {msg.content}
              </div>
              {msg.type === 'gpt' && isSelfTherapist && (
                <div className="flex flex-col mt-2 space-y-1 text-sm text-gray-600">
                  <p>Was this helpful?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => sendFeedback('👍', msg.content, messages)}
                      className="px-3 py-1 rounded bg-green-100 hover:bg-green-200"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => sendFeedback('👎', msg.content, messages)}
                      className="px-3 py-1 rounded bg-red-100 hover:bg-red-200"
                    >
                      👎
                    </button>
                  </div>
                  <textarea
                    placeholder="Want to share why?"
                    className="mt-1 w-full border border-gray-300 rounded p-1"
                    onBlur={(e) => sendFeedback('comment', msg.content, messages, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="text-center mt-2 text-xl">❤️ ❤️ 🙏</div>

        <div className="flex flex-col sm:flex-row items-center mt-4 gap-2 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-2 rounded-lg bg-black text-white placeholder-gray-400 border border-gray-800 shadow-sm"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
