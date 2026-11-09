import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import MessageBubble from '../../components/MessageBubble';
import { mockGuardianData } from '../../mock/guardianData';
import { Send, Eye } from 'lucide-react';

export default function GuardianMessages() {
  const [messages, setMessages] = useState(mockGuardianData.messages);
  const [input, setInput] = useState('');

  const handleSend = (text) => {
    if (!text.trim()) return;
    const newMessage = {
      from: 'guardian',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const quickReplies = ["I'm watching 🙏", "Call me now", "I'm coming!", "Are you safe?", "Stay calm"];

  return (
    <div className="min-h-screen flex flex-col h-screen">
      <Navbar />
      
      <div className="bg-safe/10 border-b border-safe/30 p-2 flex justify-center items-center px-4">
        <span className="text-safe font-medium text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" /> Manya is online and safe
        </span>
      </div>

      <main className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col">
        <div className="flex-1 mt-auto">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isOwn={msg.from === 'guardian'} />
          ))}
        </div>
      </main>

      <div className="border-t border-card-border bg-card p-4">
        <div className="max-w-lg mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
            {quickReplies.map((reply, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(reply)}
                className="whitespace-nowrap px-3 py-1.5 bg-background border border-card-border rounded-full text-sm text-muted hover:text-text hover:border-primary transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              className="flex-1 bg-background border border-card-border rounded-full px-4 py-2 focus:outline-none focus:border-primary text-text"
              placeholder="Message Manya..."
            />
            <button 
              onClick={() => handleSend(input)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:bg-primary-hover transition-colors"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
