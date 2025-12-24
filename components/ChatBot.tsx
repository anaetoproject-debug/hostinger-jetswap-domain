
import React, { useState, useRef, useEffect } from 'react';
import { ThemeVariant } from '../types';
import { getChatStream } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  theme: ThemeVariant;
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ theme, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hello Pilot! I'm Jet Support. How can I help you navigate the cross-chain skies today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Skip the first message (greeting) to ensure history starts with 'user'
    const history = messages
      .slice(1) 
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    let modelResponse = '';
    const botMessageId = (Date.now() + 1).toString();
    
    // Add empty bot message that we'll fill with stream
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);

    try {
      const stream = getChatStream(input, history);
      for await (const chunk of stream) {
        modelResponse += chunk;
        setMessages(prev => 
          prev.map(m => m.id === botMessageId ? { ...m, text: modelResponse } : m)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC || theme === ThemeVariant.GLASSMORPHISM;

  const getWindowStyles = () => {
    switch (theme) {
      case ThemeVariant.GLASSMORPHISM:
        return 'bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl text-white';
      case ThemeVariant.DARK_FUTURISTIC:
        return 'bg-[#0B0F1A] border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-white';
      case ThemeVariant.GRADIENT_PREMIUM:
        return 'bg-white border-blue-50 shadow-2xl text-slate-800';
      default:
        return 'bg-white border-gray-100 shadow-xl text-slate-900';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-24 right-6 w-[380px] h-[550px] flex flex-col rounded-[32px] border z-[100] overflow-hidden animate-[slideUp_0.4s_ease-out] ${getWindowStyles()}`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500' : 'bg-blue-600'}`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-sm">Jet Support</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] opacity-60 uppercase tracking-tighter font-bold">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? (theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500 text-white' : 'bg-blue-600 text-white')
                : (isDark ? 'bg-white/10 text-white border border-white/10' : 'bg-gray-100 text-slate-700')
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].role === 'user' && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-2xl flex gap-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className={`p-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <input 
            type="text"
            placeholder="Ask anything about Jet Swap..."
            className={`flex-1 bg-transparent border-none outline-none text-sm p-1 placeholder:opacity-40`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`p-2 rounded-xl transition-all ${
              theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500 text-white hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-blue-600 text-white'
            } disabled:opacity-30`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
