import React from 'react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message, isOwn }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div 
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-primary text-white rounded-br-sm' 
            : 'bg-card border border-card-border text-text rounded-bl-sm'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      <span className="text-[10px] text-muted mt-1 px-1">{message.time}</span>
    </motion.div>
  );
}
