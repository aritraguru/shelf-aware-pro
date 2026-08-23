"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Send, Bot, Check, CheckCheck, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import DemoHeader from "./DemoHeader";

export default function DistributorChatClient({ distributorId }: { distributorId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  
  const endRef = useRef<HTMLDivElement>(null);

  const [allData, setAllData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [res1, res2, res3] = await Promise.all([
          fetch(`/api/dashboard/1`),
          fetch(`/api/dashboard/2`),
          fetch(`/api/dashboard/3`),
        ]);
        const json1 = await res1.json();
        const json2 = await res2.json();
        const json3 = await res3.json();
        setAllData([json1, json2, json3]);
        
        // Active distributor data
        const activeJson = [json1, json2, json3].find(j => j.distributor.id.toString() === distributorId);
        if (activeJson) setData(activeJson);
        
        // Check if we have saved messages for active distributor
        const savedMessages = localStorage.getItem(`chat_messages_${distributorId}`);
        if (savedMessages && JSON.parse(savedMessages).length > 0) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages([{
            id: 'system-init',
            text: 'System: Simulation reset to Today. The chat is currently empty.\n\nClick the "+" button in the Date Simulator at the top right to advance time. The AI will automatically message the distributor when a predicted stockout date is reached.',
            sender: 'bot',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [distributorId]);

  const [simulatedDate, setSimulatedDate] = useState<string>("");
  const [language, setLanguage] = useState("en");

  // Load language and date from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(`chat_language_${distributorId}`);
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage("en");
    }

    const savedDate = localStorage.getItem('global_simulated_date');
    if (savedDate) {
      setSimulatedDate(savedDate);
    }
  }, [distributorId]);

  const alertTranslations: Record<string, (n: string, s: string, q: number) => string> = {
    en: (n, s, q) => `Hi ${n},\n\nOur system predicts you will run out of stock of ${s} today. We propose a restock order of ${q} units.\n\nReply "Yes" to approve, "No" to cancel, or specify quantities to modify (e.g. "change to 50").`,
    hi: (n, s, q) => `नमस्ते ${n},\n\nहमारे सिस्टम का अनुमान है कि आज आपके पास ${s} का स्टॉक खत्म हो जाएगा। हम ${q} यूनिट्स का रीस्टॉक ऑर्डर करने का प्रस्ताव देते हैं।\n\nस्वीकार करने के लिए "Yes" (हाँ), रद्द करने के लिए "No" (नहीं) या मात्रा बदलने के लिए विवरण दें (जैसे "change to 50").`,
    gu: (n, s, q) => `નમસ્તે ${n},\n\nઅમારું સિસ્ટમ અંદાજ લગાવે છે કે આજે તમારો ${s} નો સ્ટોક ખતમ થઈ જશે. અમે ${q} યુનિટ્સના રિસ્ટોક ઓર્ડરનો પ્રસ્તાવ મૂકીએ છીએ.\n\nમંજૂર કરવા માટે "Yes" (હા), રદ કરવા માટે "No" (ના), અથવા માત્રા બદલવા માટે વિગતો આપો (જેમ કે "change to 50").`,
    bn: (n, s, q) => `নমস্কার ${n},\n\nআমাদের সিস্টেম অনুমান করছে যে আজ আপনার ${s}-এর স্টক ফুরিয়ে যাবে। আমরা ${q} ইউনিটের একটি রিস্টক অর্ডারের প্রস্তাব করছি।\n\nঅনুমোদন করতে "Yes" (হ্যাঁ), বাতিল করতে "No" (না) লিখুন, অথবা পরিমাণ পরিবর্তন করতে নির্দিষ্ট করুন (যেমন "change to 50").`,
    ta: (n, s, q) => `வணக்கம் ${n},\n\nஇன்று உங்களிடம் ${s} இருப்பு தீர்ந்துவிடும் என எங்கள் சிஸ்டம் கணிக்கிறது. ${q} யூனிட்களுக்கான ரீஸ்டாக் ஆர்டரை நாங்கள் பரிந்துரைக்கிறோம்.\n\nஒப்புதல் அளிக்க "Yes" (ஆம்), ரத்து செய்ய "No" (இல்லை), அல்லது அளவை மாற்ற குறிப்பிடவும் (உம். "change to 50").`,
    te: (n, s, q) => `నమస్కారం ${n},\n\nఈరోజు మీ వద్ద ${s} స్టాక్ అయిపోతుందని మా సిస్టమ్ అంచనా వేస్తోంది. మేము ${q} యూనిట్ల రీస్టాక్ ఆర్డర్‌ను ప్రతిపాదిస్తున్నాము.\n\nఆమోదించడానికి "Yes" (అవును), రద్దు చేయడానికి "No" (కాదు) అని రిప్లై ఇవ్వండి లేదా పరిమాణాన్ని మార్చడానికి వివరాలు ఇవ్వండి (ఉదా. "change to 50").`
  };

  useEffect(() => {
    const handleDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSimulatedDate(customEvent.detail.date);
    };
    
    const handleReset = () => {
      setMessages([{
        id: 'system-init',
        text: 'System: Simulation reset to Today. The chat is currently empty.\n\nClick the "+" button in the Date Simulator at the top right to advance time. The AI will automatically message the distributor when a predicted stockout date is reached.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }]);
      for (let i = 1; i <= 3; i++) {
        localStorage.removeItem(`unread_count_${i}`);
      }
    };

    window.addEventListener('simulated_date_changed', handleDateChange);
    window.addEventListener('reset_simulation', handleReset);
    return () => {
      window.removeEventListener('simulated_date_changed', handleDateChange);
      window.removeEventListener('reset_simulation', handleReset);
    };
  }, [distributorId]);

  useEffect(() => {
    if (allData.length === 0 || !simulatedDate) return;
    
    let activeNewAlerts: any[] = [];

    allData.forEach((d) => {
      const id = d.distributor.id;
      const alertsSentStr = localStorage.getItem(`alerts_sent_${id}`) || "[]";
      const alertsSent = JSON.parse(alertsSentStr);
      let newAlerts: any[] = [];
      let currentMessagesStr = localStorage.getItem(`chat_messages_${id}`);
      let currentMessages = currentMessagesStr ? JSON.parse(currentMessagesStr) : [];

      const distLang = localStorage.getItem(`chat_language_${id}`) || 'en';

      d.skus.forEach((sku: any) => {
        const alertId = `${sku.id}_${simulatedDate}`;
        if (sku.nextOrderDate === simulatedDate && !alertsSent.includes(alertId)) {
          const alertMsg = (alertTranslations[distLang] || alertTranslations['en'])(d.distributor.name, sku.name, sku.forecastedDemand);
          
          const msgObj = {
            id: Date.now() + Math.random(),
            text: alertMsg,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: simulatedDate
          };
          newAlerts.push(msgObj);
          currentMessages.push(msgObj);
          alertsSent.push(alertId);
        }
      });

      if (newAlerts.length > 0) {
        localStorage.setItem(`alerts_sent_${id}`, JSON.stringify(alertsSent));
        localStorage.setItem(`chat_messages_${id}`, JSON.stringify(currentMessages));
        
        if (id.toString() === distributorId) {
          activeNewAlerts = [...activeNewAlerts, ...newAlerts];
        } else {
          // Increment unread count for other distributors
          const unread = parseInt(localStorage.getItem(`unread_count_${id}`) || "0");
          localStorage.setItem(`unread_count_${id}`, (unread + newAlerts.length).toString());
        }
      }
    });

    if (activeNewAlerts.length > 0) {
      setMessages(prev => {
        const updated = [...prev, ...activeNewAlerts];
        // clear unread for active
        localStorage.setItem(`unread_count_${distributorId}`, "0");
        return updated;
      });
    }
  }, [simulatedDate, allData, distributorId]);

  const CONTACTS = [
    { id: 1, name: "Distributor Alpha", image: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "Distributor Beta", image: "https://i.pravatar.cc/150?img=12" },
    { id: 3, name: "Distributor Gamma", image: "https://i.pravatar.cc/150?img=13" },
  ];
  const [chatList, setChatList] = useState(CONTACTS.map(c => ({...c, latestMessage: "No messages yet", time: "", unread: 0, timestamp: 0})));

  useEffect(() => {
    const newPreviews = CONTACTS.map(c => {
      const stored = localStorage.getItem(`chat_messages_${c.id}`);
      let latestMessage = "No messages yet";
      let time = "";
      let timestamp = 0;
      let unread = parseInt(localStorage.getItem(`unread_count_${c.id}`) || "0");
      
      if (stored) {
        const msgs = JSON.parse(stored);
        if (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          latestMessage = last.sender === 'bot' ? `Shelf Aware AI: ${last.text}` : `You: ${last.text}`;
          time = last.time;
          timestamp = last.id;
        }
      }
      return { ...c, latestMessage, time, timestamp, unread };
    });
    
    newPreviews.sort((a, b) => b.timestamp - a.timestamp);
    setChatList(newPreviews);
  }, [messages, simulatedDate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    window.dispatchEvent(new CustomEvent('demo_order_placed'));
    
    const activeDate = simulatedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newUserMsg = { 
      id: Date.now(), 
      text: userMessage, 
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: activeDate
    };

    setMessages(prev => {
      const next = [...prev, newUserMsg];
      localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify(next));
      return next;
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, distributorId, language, simulatedDate: activeDate }),
      });
      const responseData = await res.json();
      
      setTimeout(() => {
        setMessages(prev => {
          const next = [...prev, { 
            id: Date.now(), 
            text: responseData.message, 
            sender: 'bot',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: activeDate
          }];
          localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify(next));
          return next;
        });
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
    <div className="flex flex-col w-full h-full overflow-hidden bg-transparent">
      <DemoHeader />
      <div className="flex w-full flex-1 bg-white overflow-hidden min-h-0">
        {/* WhatsApp Sidebar (Contacts) */}
      <div className="w-[30%] min-w-[300px] border-r border-gray-200 bg-white flex flex-col hidden md:flex">
        <header className="bg-[#f0f2f5] h-16 px-4 flex items-center border-b border-gray-200 shrink-0">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="font-medium text-gray-800">Distributors</div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {chatList.map((contact: any) => (
            <Link key={contact.id} href={`/distributor/${contact.id}`}>
              <div className={clsx(
                "px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-[#f5f6f6] border-b border-gray-100",
                contact.id.toString() === distributorId ? "bg-[#f0f2f5]" : ""
              )}>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 border-b border-transparent pb-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-normal text-gray-900 truncate pr-2">{contact.name}</span>
                    <span className={clsx("text-xs shrink-0", contact.unread > 0 ? "text-[#00a884] font-medium" : "text-gray-400")}>
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-gray-500 truncate">{contact.latestMessage}</p>
                    {contact.unread > 0 && (
                      <span className="bg-[#00a884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative h-full">
        <header className="bg-[#f0f2f5] h-16 px-4 flex items-center gap-4 border-b border-gray-200 shrink-0 z-10">
          <Link data-tour="back-to-dashboard-btn" href={`/dashboard/${distributorId}`} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-6 h-6" />
            <span className="hidden md:inline text-sm font-medium">Dashboard</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-normal text-[16px] text-gray-900 leading-tight">Shelf Aware AI</h2>
            <p className="text-[13px] text-gray-500">online</p>
          </div>
          <div className="ml-auto">
            <select 
              data-tour="lang-dropdown"
              value={language}
              onChange={(e) => {
                const val = e.target.value;
                setLanguage(val);
                localStorage.setItem(`chat_language_${distributorId}`, val);
              }}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-[#00a884] focus:border-[#00a884] block w-full px-2 py-1 shadow-sm outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="gu">Gujarati (ગુજરાતી)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
            </select>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
          {messages.map((msg, index) => {
            const showDateHeader = index === 0 || messages[index - 1].date !== msg.date;
            
            return (
              <div key={msg.id} className="flex flex-col">
                {showDateHeader && msg.date && (
                  <div className="w-full flex justify-center my-3">
                    <span className="bg-[#e1f3fb] text-gray-800 text-[11.5px] font-medium px-3 py-1.5 rounded-lg shadow-sm">
                      {msg.date === (simulatedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })) ? 'TODAY' : msg.date.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className={clsx("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div 
                    data-tour={index === messages.length - 1 ? "chat-latest-msg" : undefined}
                    className={clsx(
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
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="bg-[#f0f2f5] p-3 flex items-center px-4 py-3 shrink-0 gap-3">
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2 bg-white rounded-lg items-center pr-2 shadow-sm">
            <input
              data-tour="chat-input"
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
    </div>
  );
}
