import { useState } from 'react';
import axios from 'axios';

export default function SelfHeal() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: [
          { role: 'system', content: 'You are a calm, emotionally intelligent guide. Speak with warmth, help users reflect, and offer insights with empathy. Speak in medium to short sentences and do not be too preachy. If possible quote examples where relevant. Use paras so reading doesn't become too painful. Each para should have no more than 3 sentences.' },
          ...newMessages
        ]
      });
      const reply = response.data.reply;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 p-6 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-700">Welcome. This space is here for you.</h1>
      <div className="w-full max-w-4xl bg-white p-6 rounded shadow-xl">
        <div className="space-y-4 h-96 overflow-y-auto border p-4 mb-6 bg-gray-50 rounded">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={msg.role === 'user' ? 'bg-blue-100 inline-block px-4 py-3 rounded-lg' : 'bg-green-100 inline-block px-4 py-3 rounded-lg'}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            rows={5}
            className="w-full p-4 border rounded resize-none text-gray-700"
            placeholder="Share what's on your mind..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white text-lg font-semibold py-3 rounded w-3/4 self-center hover:bg-blue-700 transition duration-200"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
