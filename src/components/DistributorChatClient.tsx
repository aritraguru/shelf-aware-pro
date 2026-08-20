"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Send, Bot, Check, CheckCheck, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function DistributorChatClient({ distributorId }: { distributorId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/${distributorId}`);
        const json = await res.json();
        setData(json);
        
        // Check if we have saved messages for this distributor
        const savedMessages = localStorage.getItem(`chat_messages_${distributorId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          // Formulate the initial bot message if no history exists
          let orderText = `Hi ${json.distributor.name},\n\nOur system predicts you will run out of stock on several items soon. We propose the following optimized restock order:\n\n`;
          
          // Using the solver results from the json optimization
          json.optimization.orderRecommendations.forEach((order: any) => {
            if (order.recommendedQty > 0) {
              orderText += `- ${order.recommendedQty}x ${order.name} ($${order.projectedCost})\n`;
            }
          });
          
          orderText += `\nTotal: $${json.optimization.totalCost}\n\nReply "Yes" to approve, "No" to cancel, or specify quantities to modify (e.g. "change ${json.skus[0]?.name} to 50").`;

          const initialMessage = { id: 1, text: orderText, sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
          setMessages([initialMessage]);
          localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify([initialMessage]));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [distributorId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify(messages));
    }
  }, [messages, distributorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      text: userMessage, 
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, distributorId }),
      });
      const responseData = await res.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: responseData.message, 
          sender: 'bot',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 600); // Small delay to feel like a chat

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#efeae2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-6xl mx-auto shadow-2xl bg-white overflow-hidden border-x border-gray-200">
      {/* WhatsApp Sidebar (Contacts) */}
      <div className="w-[30%] min-w-[300px] border-r border-gray-200 bg-white flex flex-col hidden md:flex">
        <header className="bg-[#f0f2f5] h-16 px-4 flex items-center border-b border-gray-200 shrink-0">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="font-medium text-gray-800">Distributors</div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {/* Mock Contact List - we could fetch all distributors here, but for demo we just link 1,2,3 */}
          {[1, 2, 3].map((id) => (
            <Link key={id} href={`/distributor/${id}`}>
              <div className={clsx(
                "px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-100",
                id.toString() === distributorId ? "bg-[#f0f2f5]" : ""
              )}>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1 border-b border-transparent pb-1">
                  <div className="flex justify-between items-center">
                    <span className="font-normal text-gray-900">Distributor {id}</span>
                    <span className="text-xs text-gray-400">12:00 PM</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">Shelf Aware AI: Hi, our system...</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative h-full">
        <header className="bg-[#f0f2f5] h-16 px-4 flex items-center gap-4 border-b border-gray-200 shrink-0 z-10">
          <Link href="/" className="md:hidden text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-normal text-[16px] text-gray-900 leading-tight">Shelf Aware AI</h2>
            <p className="text-[13px] text-gray-500">online</p>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={clsx(
                "px-4 py-2 rounded-lg shadow-sm relative whitespace-pre-wrap text-[14.2px]", 
                msg.sender === 'user' ? "bg-[#d9fdd3] rounded-tr-none text-gray-900" : "bg-white rounded-tl-none text-gray-900"
              )}>
                <span className="leading-relaxed">{msg.text}</span>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[11px] text-gray-500">{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-4 h-4 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="bg-[#f0f2f5] p-3 flex items-center px-4 py-3 shrink-0 gap-3">
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2 bg-white rounded-lg items-center pr-2 shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-lg px-4 py-3 outline-none text-gray-800 bg-transparent text-[15px]"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="text-[#00a884] p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
