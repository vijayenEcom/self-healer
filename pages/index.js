import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind or your styles

function SelfHealer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [rephrase, setRephrase] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages([...messages, userMessage]);

    if (!rephrase) {
      const brief = input.split(' ').slice(0, 10).join(' ') + '...';
      setRephrase(brief);
    }

    const replyChunks = [
      "I'm sorry to hear that.",
      "Sometimes we just need a gentle nudge to reconnect.",
      "You're not alone in feeling this way."
    ];

    for (const chunk of replyChunks) {
      await new Promise(r => setTimeout(r, 1000));
      setMessages(prev => [...prev, { type: 'gpt', content: chunk }]);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo and tagline */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-bold text-gray-800">🫂 Self Healer</div>
          <input
            value={rephrase}
            disabled
            placeholder="You’re feeling..."
            className="text-sm text-gray-600 italic bg-white rounded-md px-3 py-1 shadow-sm"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mb-2 italic">
          You're the one doing all the work — I'm just here to listen and offer a little perspective.
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-gray-700">
          Welcome. This space is here for you.
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-4 space-y-4 min-h-[400px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-2 text-base max-w-prose ${
                msg.type === 'user' ? 'bg-gray-100 self-end text-right' : 'bg-green-100 self-start text-left'
              } text-gray-800`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="text-center mt-2">
          <span className="text-xl">❤️ ❤️ 🙏</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center mt-4 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SelfHealer />);
