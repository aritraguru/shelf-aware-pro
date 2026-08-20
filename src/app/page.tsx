import { BarChart3, Bot, Box, Users, Truck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full w-full bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto py-16 px-8">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-brand-teal/10 rounded-2xl mb-6">
            <Box className="w-8 h-8 text-brand-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-brand-navy mb-4">
            Shelf Aware Pro
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Predictive B2B inventory optimization and automated outreach.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link href="/dashboard/1" className="block group">
            <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-2xl border border-gray-200 transition-all h-full cursor-pointer">
              <Users className="w-8 h-8 text-brand-teal mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Sales Rep View</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Internal dashboard to monitor upcoming distributor stockouts, analyze predictive ML forecasts, and track the status of automated AI bot outreach.
              </p>
              <span className="text-brand-teal font-medium">Enter Dashboard &rarr;</span>
            </div>
          </Link>

          <Link href="/distributor/1" className="block group">
            <div className="bg-brand-navy hover:bg-brand-navy-dark p-8 rounded-2xl text-white shadow-xl transition-all h-full cursor-pointer">
              <Truck className="w-8 h-8 text-brand-teal mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-medium mb-2">Distributor View</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                External-facing WhatsApp-style chat interface where distributors receive automated restock alerts from the AI bot and can accept, reject, or modify orders.
              </p>
              <span className="text-brand-teal font-medium">Enter Chat Interface &rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
