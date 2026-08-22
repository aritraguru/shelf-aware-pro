"use client";

import { useEffect, useState } from "react";
import SkuChart from "./SkuChart";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardClient({ distributorId }: { distributorId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("Pending Review");
  const [modifiedDemand, setModifiedDemand] = useState<{ [skuId: number]: number }>({});

  const [simulatedDate, setSimulatedDate] = useState<string>("");

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem('global_simulated_date');
    if (saved) {
      setSimulatedDate(saved);
    }

    const handleDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSimulatedDate(customEvent.detail.date);
    };
    const handleReset = () => {
      setSimulatedDate(""); // Or today
    };

    window.addEventListener('simulated_date_changed', handleDateChange);
    window.addEventListener('reset_simulation', handleReset);
    return () => {
      window.removeEventListener('simulated_date_changed', handleDateChange);
      window.removeEventListener('reset_simulation', handleReset);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = simulatedDate 
          ? `/api/dashboard/${distributorId}?date=${encodeURIComponent(simulatedDate)}&_t=${Date.now()}`
          : `/api/dashboard/${distributorId}?_t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const json = await res.json();
        setData(json);
        
        // Save forecasts for the chat client to auto-trigger messages
        if (json.skus && simulatedDate) {
          const forecasts = json.skus.map((s: any) => ({
            name: s.name,
            date: s.nextOrderDate,
            qty: s.forecastedDemand
          }));
          localStorage.setItem(`forecasts_${distributorId}`, JSON.stringify(forecasts));

          // Also generate the automated message if we just hit the date!
          const alertsSentStr = localStorage.getItem(`alerts_sent_${distributorId}`) || "[]";
          const alertsSent = JSON.parse(alertsSentStr);
          let currentMessagesStr = localStorage.getItem(`chat_messages_${distributorId}`);
          let currentMessages = currentMessagesStr ? JSON.parse(currentMessagesStr) : [];
          
          let newAlert = false;
          const distLang = localStorage.getItem(`chat_language_${distributorId}`) || 'en';
          
          const alertTranslations: Record<string, (n: string, s: string, q: number) => string> = {
            en: (n, s, q) => `[Automated ML Restock Trigger]\nHi ${n},\n\nOur system predicts you will run out of stock of ${s} today. We propose a restock order of ${q} units.\n\nReply "Yes" to approve, "No" to cancel, or specify quantities to modify (e.g. "change to 50").`,
            hi: (n, s, q) => `[Automated ML Restock Trigger]\nनमस्ते ${n},\n\nहमारे सिस्टम का अनुमान है कि आज आपके पास ${s} का स्टॉक खत्म हो जाएगा। हम ${q} यूनिट्स का रीस्टॉक ऑर्डर करने का प्रस्ताव देते हैं।\n\nस्वीकार करने के लिए "Yes" (हाँ), रद्द करने के लिए "No" (नहीं) या मात्रा बदलने के लिए विवरण दें (जैसे "change to 50").`,
            gu: (n, s, q) => `[Automated ML Restock Trigger]\nનમસ્તે ${n},\n\nઅમારું સિસ્ટમ અંદાજ લગાવે છે કે આજે તમારો ${s} નો સ્ટોક ખતમ થઈ જશે. અમે ${q} યુનિટ્સના રિસ્ટોક ઓર્ડરનો પ્રસ્તાવ મૂકીએ છીએ.\n\nમંજૂર કરવા માટે "Yes" (હા), રદ કરવા માટે "No" (ના), અથવા માત્રા બદલવા માટે વિગતો આપો (જેમ કે "change to 50").`,
            bn: (n, s, q) => `[Automated ML Restock Trigger]\nনমস্কার ${n},\n\nআমাদের সিস্টেম অনুমান করছে যে আজ আপনার ${s}-এর স্টক ফুরিয়ে যাবে। আমরা ${q} ইউনিটের একটি রিস্টক অর্ডারের প্রস্তাব করছি।\n\nঅনুমোদন করতে "Yes" (হ্যাঁ), বাতিল করতে "No" (না) লিখুন, অথবা পরিমাণ পরিবর্তন করতে নির্দিষ্ট করুন (যেমন "change to 50").`,
            ta: (n, s, q) => `[Automated ML Restock Trigger]\nவணக்கம் ${n},\n\nஇன்று உங்களிடம் ${s} இருப்பு தீர்ந்துவிடும் என எங்கள் சிஸ்டம் கணிக்கிறது. ${q} யூனிட்களுக்கான ரீஸ்டாக் ஆர்டரை நாங்கள் பரிந்துரைக்கிறோம்.\n\nஒப்புதல் அளிக்க "Yes" (ஆம்), ரத்து செய்ய "No" (இல்லை), அல்லது அளவை மாற்ற குறிப்பிடவும் (உம். "change to 50").`,
            te: (n, s, q) => `[Automated ML Restock Trigger]\nనమస్కారం ${n},\n\nఈరోజు మీ వద్ద ${s} స్టాక్ అయిపోతుందని మా సిస్టమ్ అంచనా వేస్తోంది. మేము ${q} యూనిట్ల రీస్టాక్ ఆర్డర్‌ను ప్రతిపాదిస్తున్నాము.\n\nఆమోదించడానికి "Yes" (అవును), రద్దు చేయడానికి "No" (కాదు) అని రిప్లై ఇవ్వండి లేదా పరిమాణాన్ని మార్చడానికి వివరాలు ఇవ్వండి (ఉదా. "change to 50").`
          };

          json.skus.forEach((sku: any) => {
            const alertId = `${sku.id}_${simulatedDate}`;
            if (sku.nextOrderDate === simulatedDate && !alertsSent.includes(alertId)) {
              const alertMsg = (alertTranslations[distLang] || alertTranslations['en'])(json.distributor.name, sku.name, sku.forecastedDemand);
              currentMessages.push({
                id: Date.now() + Math.random(),
                text: alertMsg,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                date: simulatedDate
              });
              alertsSent.push(alertId);
              newAlert = true;
            }
          });

          if (newAlert) {
            localStorage.setItem(`alerts_sent_${distributorId}`, JSON.stringify(alertsSent));
            localStorage.setItem(`chat_messages_${distributorId}`, JSON.stringify(currentMessages));
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [distributorId, simulatedDate]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 font-medium">
        {error || "An error occurred."}
      </div>
    );
  }

  const { distributor, skus, optimization } = data;

  const handleAction = (intent: string, payload: any) => {
    if (intent === 'approve_order') {
      setOrderStatus("Approved (Registered)");
    } else if (intent === 'cancel_order') {
      setOrderStatus("On Hold / Cancelled");
    } else if (intent === 'modify_demand' && payload?.newDemand !== undefined) {
      // Modify the first SKU's demand as a demo
      if (skus.length > 0) {
        setModifiedDemand(prev => ({
          ...prev,
          [skus[0].id]: payload.newDemand
        }));
        setOrderStatus("Modified");
      }
    }
  };

  // Merge modified demand into SKUs for display
  const displaySkus = skus.map((sku: any) => ({
    ...sku,
    forecastedDemand: modifiedDemand[sku.id] !== undefined ? modifiedDemand[sku.id] : sku.forecastedDemand
  }));

  // Note: For a full implementation, we'd recalculate the MILP optimization here on the client 
  // or re-fetch from the server. For the demo, we show the UI updating.

  return (
    <>
      <div className="flex-1 h-full flex flex-col p-4 md:p-6 pt-20 overflow-hidden">
        <header className="mb-3 flex justify-between items-end shrink-0">
          <div>
            <Link data-tour="back-to-home-btn" href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors mb-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1 drop-shadow-md">
              {distributor.name}
            </h1>
            <p className="text-slate-300 drop-shadow-sm">
              Credit Limit: <span className="font-semibold text-teal-400">${distributor.credit_limit.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Link data-tour="open-chat-btn" href={`/distributor/${distributorId}`} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/40 transition-colors">
              Open Distributor Chat →
            </Link>
            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border backdrop-blur-md ${
              orderStatus.includes('Approved') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
              orderStatus.includes('Hold') ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              orderStatus === 'Modified' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
              'bg-slate-800/50 text-slate-300 border-slate-700/50'
            }`}>
              {orderStatus}
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col">
          <h2 className="text-lg font-medium tracking-tight text-slate-200 drop-shadow-md mb-2 shrink-0">SKU Inventory & Stockout Forecast</h2>
          <div className="flex-1 min-h-0 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
              {displaySkus.map((sku: any) => (
                <div key={sku.id} className="h-full min-h-0">
                  <SkuChart 
                    sku={sku} 
                    simulatedDate={simulatedDate} 
                    distributorName={distributor.name}
                    distributorId={distributorId}
                  />
                </div>
              ))}
              {displaySkus.length === 0 && (
                <div className="text-slate-400 italic py-8">No SKUs found for this distributor.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
