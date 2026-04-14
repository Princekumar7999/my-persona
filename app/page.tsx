// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';

export default function Home() {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    const userMsg = { role: 'user', content: text, id: Date.now().toString() };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setText('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      });
      const replyText = await res.text();
      setMessages(prev => [...prev, { role: 'assistant', content: replyText, id: Date.now().toString() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1a] via-[#101a2b] to-[#0a0f1a] flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 animate-gradient-x bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-black/60 to-transparent blur-2xl" />
      <div className="w-full max-w-5xl mx-auto rounded-[2.5rem] shadow-2xl bg-gradient-to-br from-[#101a2b] via-[#0a0f1a] to-[#101a2b] border-2 border-blue-900/60 flex flex-col h-[96vh] min-h-[700px] overflow-hidden relative z-10 transition-all duration-300">
        <header className="flex items-center gap-4 px-10 py-8 bg-gradient-to-r from-blue-900 via-black to-blue-800 text-white shadow-xl animate-fade-in-down border-b-2 border-blue-800/60">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 via-black to-blue-900 flex items-center justify-center font-extrabold text-4xl shadow-xl border-2 border-blue-400/40 animate-bounce-slow">⚡</div>
          <div>
            <h1 className="font-black text-3xl leading-tight tracking-widest drop-shadow-glow animate-fade-in">Prince Kumar <span className='ml-1 text-blue-300'>AI</span></h1>
            <p className="text-sm text-blue-200 italic animate-fade-in-up">GenZ Tech Persona & Assistant</p>
          </div>
        </header>
  <main className="flex-1 overflow-y-auto px-10 py-8 space-y-8 flex flex-col bg-transparent scrollbar-thin scrollbar-thumb-blue-800/60 scrollbar-track-transparent" id="chat-container">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-blue-400 space-y-4 px-8 text-center m-auto animate-fade-in">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-900 via-black to-blue-800 flex items-center justify-center text-blue-400 mb-2 shadow-2xl animate-spin-slow border-4 border-blue-800/60">
                <User size={64} />
              </div>
              <p className="text-4xl font-extrabold text-blue-100 tracking-tight animate-fade-in-up">Hey 👋, I'm Prince's AI!</p>
              <p className="text-lg text-blue-300 animate-fade-in-up delay-100">Ask me about my <span className='font-bold text-blue-400'>skills</span>, <span className='font-bold text-blue-300'>GitHub</span>, <span className='font-bold text-blue-200'>resume</span>, or <span className='font-bold text-blue-400'>book a call</span>!</p>
            </div>
          )}
          {messages.map((m, i) => {
            // Render helper: if message content is JSON (from tools), try to extract availability and render human readable
            const extractAvailabilityFromJson = (maybeJson) => {
              try {
                const parsed = typeof maybeJson === 'string' && maybeJson.trim().length ? JSON.parse(maybeJson) : maybeJson;
                // If it's an array of tool-call results
                if (Array.isArray(parsed)) {
                  for (const el of parsed) {
                    const out = el?.output || el?.toolOutput || el?.result || el?.data;
                    if (out) {
                      const hr = out.humanReadable || out?.data?.humanReadable || out?.human_readable;
                      if (hr) return hr;
                      const slots = out?.data?.slots || out?.slots || out?.data || out?.slots_raw;
                      if (slots && typeof slots === 'object') return formatSlotsHuman(slots);
                    }
                  }
                }
                // If it's an object
                if (parsed && typeof parsed === 'object') {
                  const hr = parsed.humanReadable || parsed?.data?.humanReadable || parsed?.human_readable;
                  if (hr) return hr;
                  const slots = parsed?.data?.slots || parsed?.slots || parsed?.data;
                  if (slots && typeof slots === 'object') return formatSlotsHuman(slots);
                }
              } catch (e) {
                return null;
              }
              return null;
            };

            const formatTimePair = (iso) => {
              try {
                const d = new Date(iso);
                if (isNaN(d.getTime())) return iso;
                const utcH = String(d.getUTCHours()).padStart(2, '0');
                const utcM = String(d.getUTCMinutes()).padStart(2, '0');
                const utcStr = `${utcH}:${utcM} UTC`;
                const istMs = d.getTime() + (5.5 * 60 * 60 * 1000);
                const id = new Date(istMs);
                const hours = id.getUTCHours();
                const minutes = id.getUTCMinutes();
                const hh = ((hours + 11) % 12) + 1;
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const istStr = `${String(hh).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm} IST`;
                return `${istStr} (${utcStr})`;
              } catch (e) { return iso; }
            };

            const formatSlotsHuman = (slotsObj) => {
              try {
                const parts = [];
                const days = Object.keys(slotsObj).sort();
                for (const day of days) {
                  parts.push(`${day}`);
                  for (const t of slotsObj[day]) {
                    const iso = t.time || t;
                    parts.push(`  - ${formatTimePair(iso)}`);
                  }
                  parts.push('');
                }
                return parts.join('\n');
              } catch (e) { return null; }
            };
            // detect booking JSON in assistant messages
            const parseBooking = (text) => {
              try {
                if (!text || typeof text !== 'string') return null;
                // attempt to find the last JSON object in the text
                const jsonMatch = text.match(/\{[\s\S]*\}$/m);
                if (jsonMatch) {
                  const obj = JSON.parse(jsonMatch[0]);
                  if (obj && (obj.meetingUrl || obj.uid || obj.id)) return obj;
                }
              } catch (e) {
                return null;
              }
              return null;
            };

            // If assistant content is JSON, try to extract availability human text
            let displayContent = m.content;
            if (m.role === 'assistant' && typeof m.content === 'string' && (m.content.trim().startsWith('{') || m.content.trim().startsWith('['))) {
              const avail = extractAvailabilityFromJson(m.content);
              if (avail) displayContent = avail;
            }
            const booking = m.role === 'assistant' ? parseBooking(displayContent) : null;

            return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full group relative mb-4 animate-fade-in-up`}>
                <div className={`px-8 py-6 rounded-3xl max-w-[80%] text-lg shadow-2xl transition-all duration-300 ${m.role === 'user' ? 'bg-gradient-to-br from-blue-900 via-black to-blue-800 text-blue-100 rounded-br-3xl border-2 border-blue-700/60 animate-bounce-in' : 'bg-gradient-to-br from-[#181c2a] via-[#101a2b] to-[#23263a] border border-blue-900/40 text-blue-200 rounded-bl-3xl animate-fade-in-up'}`}
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {m.role === 'user' ? '🧑‍💻 ' : '🤖 '}{displayContent}
                  </span>
                </div>

                {booking && (
                  <div className="mt-2 px-6 py-4 rounded-lg bg-gradient-to-br from-green-800 to-green-700 text-green-100 shadow-lg max-w-[70%]">
                    <div className="font-bold text-lg">Booking confirmed ✅</div>
                    <div className="text-sm mt-1">{booking.title || 'Meeting booked'}</div>
                    <div className="text-sm mt-1">Start: {booking.start ? new Date(booking.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}</div>
                    <div className="text-sm">Duration: {booking.duration ? booking.duration + ' minutes' : ''}</div>
                    {booking.meetingUrl && (
                      <a className="inline-block mt-2 text-blue-200 underline" href={booking.meetingUrl} target="_blank" rel="noreferrer">Open meeting URL</a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start w-full group relative mb-2 animate-fade-in-up">
              <div className="px-6 py-4 rounded-3xl max-w-[75%] text-base bg-white/90 dark:bg-[#23263a]/80 border border-fuchsia-200/40 dark:border-[#23263a] text-gray-900 dark:text-gray-100 rounded-bl-2xl shadow-xl flex items-center space-x-2 animate-pulse">
                <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>
        <form onSubmit={submitForm} className="px-10 py-6 bg-gradient-to-r from-blue-900 via-black to-blue-800 border-t-2 border-blue-800/60 flex items-center gap-4 relative animate-fade-in-up">
          <input
            className="flex-1 border border-blue-700 dark:border-blue-900 rounded-full px-8 py-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:bg-black dark:focus:bg-[#181c2a] transition-all text-lg bg-gradient-to-br from-[#101a2b] via-[#0a0f1a] to-[#101a2b] text-blue-200 placeholder:text-blue-400 dark:placeholder:text-blue-500 font-mono"
            value={text}
            placeholder="Type your GenZ question... 💬"
            onChange={(e) => setText(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          <button type="submit" disabled={!text.trim() || isLoading} className="bg-gradient-to-br from-blue-900 via-black to-blue-800 hover:from-blue-800 hover:to-black disabled:opacity-50 text-blue-100 p-5 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center animate-bounce-in absolute right-12 -top-8 z-20 border-4 border-blue-800/40">
            <Send size={30} className="drop-shadow-glow" />
          </button>
        </form>
        <footer className="text-xs text-center text-blue-400 py-4 bg-transparent font-mono animate-fade-in-up">✨ &copy; {new Date().getFullYear()} Prince Kumar AI Persona ✨</footer>
      </div>
    </div>
  );
}
