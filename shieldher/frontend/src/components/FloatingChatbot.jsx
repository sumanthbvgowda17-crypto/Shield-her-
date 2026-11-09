import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Shield, ChevronDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom 3D Shield Floating Avatar Component
function Floating3DShieldLogo({ isOpen, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
      whileTap={{ scale: 0.92 }}
      animate={{
        y: [0, -8, 0],
        rotateZ: [0, 1.5, -1.5, 0]
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative group cursor-pointer focus:outline-none"
      title="Open ShieldHer Safety Assistant"
    >
      {/* Outer Atmospheric Pulsing Rings */}
      <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse"></span>
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80 blur-sm"></span>

      {/* Main 3D Spherical Shield Capsule */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-purple-500/90 via-indigo-900 to-black p-0.5 shadow-[0_15px_35px_rgba(139,92,246,0.65),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center overflow-hidden border border-white/30 backdrop-blur-xl">
        
        {/* Specular 3D Reflection Curve */}
        <div className="absolute top-0 left-1/4 right-1/4 h-5 bg-gradient-to-b from-white/70 to-transparent rounded-full blur-[0.5px]"></div>
        
        {/* 3D Inner Emblem: Embossed Shield & Heart Gem */}
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="w-7 h-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Shield className="w-8 h-8 text-white fill-purple-400/30 stroke-[2.2] drop-shadow-[0_4px_12px_rgba(168,85,247,0.9)]" />
              <div className="absolute w-3 h-3 rounded-full bg-gradient-to-tr from-pink-400 to-white shadow-[0_0_10px_rgba(244,63,94,1)] animate-ping"></div>
              <div className="absolute w-2.5 h-2.5 rounded-full bg-pink-300 shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
            </div>
          )}
        </div>

        {/* 3D Depth Shadow inside orb */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>
    </motion.button>
  );
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am your **ShieldHer Safety Assistant**. How can I help you with emergency guidance or safe travel today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Emergency: What to do right now?",
    "Find nearest safe zone",
    "Women safety helpline numbers",
    "Tips for walking home alone"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) throw new Error('Chat API response was not ok');
      const data = await response.json();
      
      const assistantMessage = data.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'If you are in immediate danger, please press the **SOS Panic Button** on your screen or dial **112 / 1091** immediately.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Conversation reset. What safety questions can I answer for you?' 
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* 3D Glassy Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto mb-4 w-[92vw] sm:w-[420px] h-[560px] max-h-[82vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(139,92,246,0.25)] border border-white/20 backdrop-blur-2xl bg-[#0d0c14]/90 text-text"
            style={{ perspective: '1000px' }}
          >
            {/* Glossy Header */}
            <div className="relative p-4 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-950/90 border-b border-white/10 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.7)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    ShieldHer Safety Assistant
                  </h3>
                  <p className="text-[10px] text-purple-200/80 font-medium">Emergency Guidance & Protocol</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-black/40">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white' 
                        : 'bg-zinc-800 border border-white/20 text-purple-300'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none border border-purple-400/30' 
                        : 'bg-zinc-900/80 border border-white/10 text-zinc-100 rounded-tl-none backdrop-blur-md'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/20 text-purple-300 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-muted rounded-tl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(sug)}
                  className="shrink-0 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-zinc-950/90">
              <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/15 focus-within:border-purple-500 rounded-2xl px-3 py-1.5 shadow-inner transition-colors">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask safety advice or emergency guidance..."
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none py-1.5"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Shield Button */}
      <div className="pointer-events-auto">
        <Floating3DShieldLogo isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </div>

    </div>
  );
}
