import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PackageSearch } from 'lucide-react';

export default async function Sidebar() {
  const { data: distributors, error } = await supabase.from('distributors_new').select('*');

  return (
    <div className="w-64 bg-brand-navy text-white flex flex-col h-screen shrink-0 border-r border-brand-navy-dark">
      <div className="p-6 border-b border-brand-navy-dark flex items-center gap-3">
        <PackageSearch className="w-6 h-6 text-brand-teal" />
        <h1 className="text-xl font-semibold tracking-tight">Shelf Aware Pro</h1>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4 font-medium px-2">Distributors</h2>
        <ul className="space-y-1">
          {distributors?.map((dist) => (
            <li key={dist.id}>
              <Link 
                href={`/dashboard/${dist.id}`}
                className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium"
              >
                {dist.name}
              </Link>
            </li>
          ))}
          {(!distributors || distributors.length === 0) && !error && (
            <p className="text-sm text-gray-400 px-2 italic">No distributors found.</p>
          )}
          {error && (
            <p className="text-sm text-red-400 px-2">Error loading distributors.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
