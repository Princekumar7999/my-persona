// @ts-nocheck
"use client";

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, User } from 'lucide-react';

export default function Chat() {
  const { messages, append, isLoading } = useChat({
    api: '/api/chat'
  });
  const [text, setText] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    append({ role: 'user', content: text });
    setText('');
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-screen bg-gray-50 shadow-xl overflow-hidden font-sans border-x border-gray-200">
      <header className="bg-[#1e293b] p-4 text-white flex items-center shadow-md z-10 w-full shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg mr-3 shadow-sm shadow-blue-500/50">
          PK
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Prince Kumar</h1>
          <p className="text-xs text-blue-200 italic">AI Persona & Assistant</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 w-full flex flex-col" id="chat-container">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 px-6 text-center m-auto">
             <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
               <User size={40} />
             </div>
             <p className="text-xl font-medium text-slate-700">Chat with Prince's AI Persona</p>
             <p className="text-sm">Ask me about my background, skills, GitHub projects, or schedule an interview!</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full group relative mb-2`}>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-sm' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm shadow-slate-200'}`}>
               <span className="whitespace-pre-wrap leading-relaxed">{m.content}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full group relative mb-2">
             <div className="p-4 rounded-2xl max-w-[85%] text-sm bg-white border text-gray-800 rounded-bl-none shadow-sm shadow-slate-200 flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
             </div>
          </div>
        )}
      </main>

      <form onSubmit={submitForm} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          className="flex-1 border bg-slate-50 border-gray-300 rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          value={text}
          placeholder="Ask me anything..."
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!text.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
