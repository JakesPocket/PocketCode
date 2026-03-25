import { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: 'ai', text: data.reply }]);
    } catch {
      setMessages((msgs) => [...msgs, { sender: 'ai', text: 'Error: Could not reach AI.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words ${
              msg.sender === 'user'
                ? 'self-end bg-vscode-accent text-white'
                : 'self-start bg-vscode-sidebar text-vscode-text'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-vscode-sidebar text-vscode-text-muted max-w-[80%] px-3 py-2 rounded-2xl text-sm">
            AI is thinking...
          </div>
        )}
      </div>
      <form
        className="flex border-t border-vscode-border p-2 gap-2"
        style={{ backgroundColor: 'var(--color-vscode-nav)' }}
        onSubmit={handleSend}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 bg-vscode-sidebar text-vscode-text placeholder-vscode-text-muted px-3 py-2 rounded-2xl border border-vscode-border outline-none text-sm min-h-[44px]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-vscode-accent text-white px-4 py-2 rounded-2xl text-sm font-medium min-h-[44px] min-w-[44px] cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
