import React, { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../services/api';

export default function StudyAssistant({ currentModule }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI study assistant. Ask me anything about your roadmap modules, concepts, or career questions." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const ctx = currentModule ? `${currentModule.title}: ${currentModule.description}` : null;
      const answer = await askAssistant(q, ctx);
      setMessages(m => [...m, { role: 'assistant', text: answer }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I had trouble answering that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-300"
        style={{
          background: open ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#4f46e5,#34d399)',
          boxShadow: '0 0 30px rgba(99,102,241,0.5)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        title={open ? 'Close assistant' : 'Open AI Study Assistant'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 md:w-96 flex flex-col rounded-2xl overflow-hidden animate-in"
          style={{
            height: '480px',
            background: 'rgba(15,15,26,0.97)',
            border: '1px solid rgba(99,102,241,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)',
          }}>

          {/* Header */}
          <div className="px-4 py-3 flex-shrink-0 flex items-center gap-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(99,102,241,0.08)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}>🤖</div>
            <div>
              <p className="text-sm font-bold text-slate-100">AI Study Assistant</p>
              <p className="text-xs text-slate-500">Granite 3.0 AI · Ask anything</p>
            </div>
            {currentModule && (
              <span className="ml-auto tag-pill text-xs truncate max-w-24" title={currentModule.title}>
                {currentModule.title.split(' ').slice(0, 3).join(' ')}…
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#e2e8f0',
                    borderBottomRightRadius: '4px',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    borderBottomLeftRadius: '4px',
                  }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce inline-block" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce inline-block" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce inline-block" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about a concept, topic, or career..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="text-slate-700 text-xs mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </>
  );
}
