import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { baseDate } = await request.json();
    
    if (isSupabaseConfigured && baseDate) {
      const d = new Date(baseDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const baseDateStr = `${yyyy}-${mm}-${dd}`;
      // Delete any data AFTER the base date
      await supabaseAdmin
        .from('historical_data_new')
        .delete()
        .gt('date', baseDateStr);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
