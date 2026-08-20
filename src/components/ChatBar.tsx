"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import clsx from "clsx";

export default function ChatBar({ onAction }: { onAction?: (intent: string, payload: any) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: number; text: string; sender: 'user' | 'ai'; sentiment?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: data.message, 
        sender: 'ai',
        sentiment: data.sentiment 
      }]);

      if (onAction && data.intent) {
        onAction(data.intent, data.actionPayload);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Failed to parse intent.", sender: 'ai', sentiment: 'critical' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200">
      <div className="max-w-4xl mx-auto p-4">
        {messages.length > 0 && (
          <div className="max-h-48 overflow-y-auto mb-4 space-y-3 px-2">
            {messages.map(msg => (
              <div key={msg.id} className={clsx("flex flex-col", msg.sender === 'user' ? "items-end" : "items-start")}>
                <div className={clsx(
                  "px-4 py-2 rounded-2xl max-w-[80%] text-sm",
                  msg.sender === 'user' 
                    ? "bg-gray-100 text-gray-800 rounded-br-none" 
                    : "rounded-bl-none font-medium flex items-center gap-2",
                  msg.sender === 'ai' && msg.sentiment === 'critical' ? "bg-red-50 text-red-700 border border-red-100" : "",
                  msg.sender === 'ai' && msg.sentiment === 'positive' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "",
                  msg.sender === 'ai' && msg.sentiment === 'neutral' ? "bg-brand-navy/5 text-brand-navy border border-brand-navy/10" : ""
                )}>
                  {msg.sender === 'ai' && <Sparkles className="w-4 h-4 shrink-0" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 rounded-bl-none flex items-center gap-2 text-gray-400 text-sm">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a command (e.g. 'Cancel the order', 'Approve all')"
            className="w-full bg-white border border-gray-300 rounded-full pl-6 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent shadow-sm text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-dark transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
