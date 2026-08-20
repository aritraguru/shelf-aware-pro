"use client";

import { useEffect, useState } from "react";
import SkuChart from "./SkuChart";
import { Loader2 } from "lucide-react";

export default function DashboardClient({ distributorId }: { distributorId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("Pending Review");
  const [modifiedDemand, setModifiedDemand] = useState<{ [skuId: number]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/${distributorId}`);
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
  }, [distributorId]);

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
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-navy mb-2">
              {distributor.name}
            </h1>
            <p className="text-gray-500">
              Credit Limit: <span className="font-semibold text-gray-700">${distributor.credit_limit.toLocaleString()}</span>
            </p>
          </div>
          <div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
              orderStatus.includes('Approved') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              orderStatus.includes('Hold') ? 'bg-red-100 text-red-700 border-red-200' :
              orderStatus === 'Modified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {orderStatus}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="space-y-6">
            <h2 className="text-xl font-medium tracking-tight text-gray-800">SKU Inventory & Stockout Forecast</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displaySkus.map((sku: any) => (
                <SkuChart key={sku.id} sku={sku} />
              ))}
              {displaySkus.length === 0 && (
                <div className="text-gray-400 italic py-8">No SKUs found for this distributor.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
