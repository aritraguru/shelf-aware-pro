"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SkuChart({ sku }: { sku: any }) {
  const data = sku.history.map((h: any) => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    sales: h.units_sold,
  }));

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">{sku.name}</h3>
        <p className="text-sm text-gray-500">Margin: ${sku.margin} | Cost: ${sku.cost}</p>
        <p className="text-sm font-medium text-brand-teal mt-1">
          Forecast: {sku.forecastedDemand} units
        </p>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dx={-10} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#5b8e7d" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#2c3e50' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
