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
          ? `/api/dashboard/${distributorId}?date=${encodeURIComponent(simulatedDate)}`
          : `/api/dashboard/${distributorId}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const json = await res.json();
        setData(json);
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
      <div className="flex-1 h-full flex flex-col p-8 overflow-hidden">
        <header className="mb-6 flex justify-between items-end shrink-0">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors mb-4 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2 drop-shadow-md">
              {distributor.name}
            </h1>
            <p className="text-slate-300 drop-shadow-sm">
              Credit Limit: <span className="font-semibold text-teal-400">${distributor.credit_limit.toLocaleString()}</span>
            </p>
          </div>
          <div>
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
          <h2 className="text-xl font-medium tracking-tight text-slate-200 drop-shadow-md mb-4 shrink-0">SKU Inventory & Stockout Forecast</h2>
          <div className="flex-1 min-h-0 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
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
