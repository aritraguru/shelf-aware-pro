import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Send } from "lucide-react";

export default function SkuChart({ sku, simulatedDate, distributorName, distributorId }: { sku: any, simulatedDate: string, distributorName: string, distributorId: string }) {
  const [justSent, setJustSent] = useState(false);

  const data = sku.history.map((h: any) => {
    const [y, m, d] = h.date.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
    return {
      date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      sales: h.units_sold,
    };
  });

  const simDate = simulatedDate ? new Date(simulatedDate) : new Date();
  const nextDate = new Date(sku.nextOrderDate);
  
  // zero out the time parts for pure day diffs
  simDate.setHours(0,0,0,0);
  nextDate.setHours(0,0,0,0);

  const diffTime = simDate.getTime() - nextDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let btnColor = "bg-teal-500 hover:bg-teal-400 border-teal-600";
  let statusText = "";
  let textColor = "text-teal-400";

  if (diffDays === 1) {
    btnColor = "bg-amber-500 hover:bg-amber-400 border-amber-600";
    statusText = "1 Day Late - Follow Up Needed";
    textColor = "text-amber-400";
  } else if (diffDays >= 2) {
    btnColor = "bg-red-500 hover:bg-red-400 border-red-600";
    statusText = "2+ Days Late - Action Required";
    textColor = "text-red-400";
  }

  const handleOverride = () => {
    const alertTranslations: Record<string, (n: string, s: string, q: number) => string> = {
      en: (n, s, q) => `[MANUAL OVERRIDE]\nHi ${n},\n\nOur system predicts you will run out of stock of ${s} today. We propose a restock order of ${q} units.\n\nReply "Yes" to approve, "No" to cancel, or specify quantities to modify (e.g. "change to 50").`,
      hi: (n, s, q) => `[MANUAL OVERRIDE]\nनमस्ते ${n},\n\nहमारे सिस्टम का अनुमान है कि आज आपके पास ${s} का स्टॉक खत्म हो जाएगा। हम ${q} यूनिट्स का रीस्टॉक ऑर्डर करने का प्रस्ताव देते हैं।\n\nस्वीकार करने के लिए "Yes" (हाँ), रद्द करने के लिए "No" (नहीं) या मात्रा बदलने के लिए विवरण दें (जैसे "change to 50").`,
      gu: (n, s, q) => `[MANUAL OVERRIDE]\nનમસ્તે ${n},\n\nઅમારું સિસ્ટમ અંદાજ લગાવે છે કે આજે તમારો ${s} નો સ્ટોક ખતમ થઈ જશે. અમે ${q} યુનિટ્સના રિસ્ટોક ઓર્ડરનો પ્રસ્તાવ મૂકીએ છીએ.\n\nમંજૂર કરવા માટે "Yes" (હા), રદ કરવા માટે "No" (ના), અથવા માત્રા બદલવા માટે વિગતો આપો (જેમ કે "change to 50").`,
      bn: (n, s, q) => `[MANUAL OVERRIDE]\nনমস্কার ${n},\n\nআমাদের সিস্টেম অনুমান করছে যে আজ আপনার ${s}-এর স্টক ফুরিয়ে যাবে। আমরা ${q} ইউনিটের একটি রিস্টক অর্ডারের প্রস্তাব করছি।\n\nঅনুমোদন করতে "Yes" (হ্যাঁ), বাতিল করতে "No" (না) লিখুন, অথবা পরিমাণ পরিবর্তন করতে নির্দিষ্ট করুন (যেমন "change to 50").`,
      ta: (n, s, q) => `[MANUAL OVERRIDE]\nவணக்கம் ${n},\n\nஇன்று உங்களிடம் ${s} இருப்பு தீர்ந்துவிடும் என எங்கள் சிஸ்டம் கணிக்கிறது. ${q} யூனிட்களுக்கான ரீஸ்டாக் ஆர்டரை நாங்கள் பரிந்துரைக்கிறோம்.\n\nஒப்புதல் அளிக்க "Yes" (ஆம்), ரத்து செய்ய "No" (இல்லை), அல்லது அளவை மாற்ற குறிப்பிடவும் (உம். "change to 50").`,
      te: (n, s, q) => `[MANUAL OVERRIDE]\nనమస్కారం ${n},\n\nఈరోజు మీ వద్ద ${s} స్టాక్ అయిపోతుందని మా సిస్టమ్ అంచనా వేస్తోంది. మేము ${q} యూనిట్ల రీస్టాక్ ఆర్డర్‌ను ప్రతిపాదిస్తున్నాము.\n\nఆమోదించడానికి "Yes" (అవును), రద్దు చేయడానికి "No" (కాదు) అని రిప్లై ఇవ్వండి లేదా పరిమాణాన్ని మార్చడానికి వివరాలు ఇవ్వండి (ఉదా. "change to 50").`
    };

    const distLang = localStorage.getItem(`chat_language_${distributorId}`) || 'en';
    const alertMsg = (alertTranslations[distLang] || alertTranslations['en'])(distributorName, sku.name, sku.forecastedDemand);
    
    let currentMessagesStr = localStorage.getItem(`chat_messages_${distributorId}`);
    let currentMessages = currentMessagesStr ? JSON.parse(currentMessagesStr) : [];
    
    currentMessages.push({
      id: Date.now() + Math.random(),
      text: alertMsg,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: simulatedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    
    localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify(currentMessages));
    
    const unread = parseInt(localStorage.getItem(`unread_count_${distributorId}`) || "0");
    localStorage.setItem(`unread_count_${distributorId}`, (unread + 1).toString());

    setJustSent(true);
    setTimeout(() => setJustSent(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg shadow-teal-900/5 h-full flex flex-col relative">
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div>
          <h3 className="font-semibold text-slate-100">{sku.name}</h3>
          <p className="text-sm text-slate-400">Margin: ${sku.margin} | Cost: ${sku.cost}</p>
          <p className="text-sm font-medium mt-1 text-slate-300">
            Next Predicted Order: <span data-tour="forecast-date-0" className="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{sku.nextOrderDate}</span>
          </p>
          <p className="text-xs text-teal-500/70 mt-1">
            Forecasted Qty: {sku.forecastedDemand} units
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <button 
            data-tour="manual-override-btn"
            onClick={handleOverride}
            disabled={justSent}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-semibold text-white shadow-sm transition-colors ${justSent ? 'bg-slate-600 border-slate-700' : btnColor}`}
          >
            {justSent ? "Message Sent!" : "Manual Override"}
            {!justSent && <Send className="w-3 h-3" />}
          </button>
          {statusText && !justSent && (
            <p className={`text-[10px] mt-1.5 font-semibold ${textColor}`}>
              {statusText}
            </p>
          )}
        </div>
      </div>
      
      <div data-tour="sku-chart-0" className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', color: '#f1f5f9' }}
              itemStyle={{ color: '#2dd4bf' }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#2dd4bf" 
              strokeWidth={3}
              dot={{ r: 2, fill: '#14b8a6', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#67e8f9', stroke: '#0891b2', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
