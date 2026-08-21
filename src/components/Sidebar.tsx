import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Image from "next/image";

const FALLBACK_DISTRIBUTORS = [
  { id: 1, name: "Apex Wholesale Dist." },
  { id: 2, name: "Metro Beverage Partners" },
  { id: 3, name: "Pacific Goods Supply" }
];

export default async function Sidebar() {
  let distributors = FALLBACK_DISTRIBUTORS;
  let hasError = false;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('distributors_new').select('*');
      if (!error && data && data.length > 0) {
        distributors = data;
      }
    } catch {
      hasError = true;
    }
  }

  return (
    <div className="w-80 bg-slate-950/60 backdrop-blur-md text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800/80">
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <Image src="/logo.svg" alt="Shelf Aware Logo" width={32} height={32} className="brightness-200" />
        <Link href="/" className="text-xl font-semibold tracking-tight hover:text-teal-400 transition-colors">
          Shelf Aware Pro
        </Link>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-medium px-2">Distributors</h2>
        <ul className="space-y-1">
          {distributors.map((dist) => (
            <li key={dist.id}>
              <Link 
                href={`/dashboard/${dist.id}`}
                className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {dist.name}
              </Link>
            </li>
          ))}
          {distributors.length === 0 && !hasError && (
            <p className="text-sm text-slate-400 px-2 italic">No distributors found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
