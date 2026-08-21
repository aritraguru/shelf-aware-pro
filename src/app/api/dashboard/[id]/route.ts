import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import solver from 'javascript-lp-solver';
import regression from 'regression';

const MOCK_DISTRIBUTORS: Record<string, any> = {
  "1": { id: 1, name: "Apex Wholesale Dist.", credit_limit: 75000 },
  "2": { id: 2, name: "Metro Beverage Partners", credit_limit: 50000 },
  "3": { id: 3, name: "Pacific Goods Supply", credit_limit: 60000 },
};

const MOCK_SKUS = [
  { id: 1, distributor_id: 1, name: "Sparkling Citrus 24pk", current_inventory: 18, cost: 22.5, margin: 11.5, lead_time_days: 3 },
  { id: 2, distributor_id: 1, name: "Organic Cold Brew 12pk", current_inventory: 12, cost: 18.0, margin: 9.0, lead_time_days: 2 },
  { id: 3, distributor_id: 1, name: "Artisan Ginger Ale 24pk", current_inventory: 35, cost: 24.0, margin: 13.0, lead_time_days: 4 },
  { id: 4, distributor_id: 1, name: "Matcha Latte Cans 12pk", current_inventory: 8, cost: 26.0, margin: 14.5, lead_time_days: 3 },
];

function generateMockHistory(skuId: number, baseDateObj: Date) {
  const history = [];
  const now = baseDateObj;
  
  const baseOrderQty = skuId === 1 ? 150 : skuId === 2 ? 80 : skuId === 3 ? 120 : 60;
  const offset = skuId % 3;
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    let units_sold = 0;
    if (i % 7 === (skuId % 7)) {
       units_sold = baseOrderQty + Math.floor(Math.random() * 20 - 10);
    }
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    history.push({
      id: 1000 + i,
      sku_id: skuId,
      date: `${yyyy}-${mm}-${dd}`,
      units_sold
    });
  }
  return history;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const url = new URL(request.url);
  const simulatedDateStr = url.searchParams.get('date');
  
  let baseDateObj = new Date();
  if (simulatedDateStr) {
    const parsed = new Date(simulatedDateStr);
    if (!isNaN(parsed.getTime())) {
      baseDateObj = parsed;
    }
  }

  let distributor = null;
  let skus: any[] = [];
  let historicalData: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data: distData } = await supabase
        .from('distributors_new')
        .select('*')
        .eq('id', id)
        .single();
      
      distributor = distData;

      if (distributor) {
        const { data: skusData } = await supabase
          .from('skus_new')
          .select('*')
          .eq('distributor_id', id);

        skus = skusData || [];

        if (skus.length > 0) {
          const skuIds = skus.map(s => s.id);
          const { data: histData } = await supabase
            .from('historical_data_new')
            .select('*')
            .in('sku_id', skuIds);
          historicalData = histData || [];
        }
      }
    } catch (e) {
      console.warn("Supabase query fallback:", e);
    }
  }

  if (!distributor) {
    distributor = MOCK_DISTRIBUTORS[id] || { id: Number(id) || 1, name: `Distributor ${id}`, credit_limit: 50000 };
    skus = MOCK_SKUS.map(s => ({ ...s, distributor_id: Number(id) || 1 }));
    historicalData = skus.flatMap(s => generateMockHistory(s.id, baseDateObj));
  }

  // Filter historical data up to simulatedDate
  const cutoffTime = baseDateObj.getTime() + (24 * 60 * 60 * 1000) - 1; // End of simulated day
  historicalData = historicalData.filter(h => new Date(h.date).getTime() <= cutoffTime);

  // Process data for charts and ML forecast
  const skusWithData = skus.map(sku => {
    const skuHistory = historicalData
      .filter(h => h.sku_id === sku.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // We want the last 30 days BEFORE baseDateObj
    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDateObj);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const matchingEvents = skuHistory.filter(h => h.date === dateStr);
      if (matchingEvents.length > 0) {
        const totalSales = matchingEvents.reduce((acc, curr) => acc + curr.units_sold, 0);
        past30Days.push({ sku_id: sku.id, date: dateStr, units_sold: totalSales });
      } else {
        past30Days.push({ sku_id: sku.id, date: dateStr, units_sold: 0 });
      }
    }
    
    let forecastedDemand = 0;
    let nextOrderDate = "Unknown";
    
    const orderEvents = skuHistory.filter(h => h.units_sold > 0);
    if (orderEvents.length > 0) {
      const orderDates = orderEvents.map(h => new Date(h.date).getTime());
      
      if (orderDates.length >= 2) {
        const intervals = [];
        for (let i = 1; i < orderDates.length; i++) {
          intervals.push((orderDates[i] - orderDates[i-1]) / (1000 * 60 * 60 * 24));
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const lastOrderTime = orderDates[orderDates.length - 1];
        const nextTime = lastOrderTime + avgInterval * (1000 * 60 * 60 * 24);
        nextOrderDate = new Date(nextTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        nextOrderDate = new Date(orderDates[0] + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      
      const avgSize = orderEvents.reduce((acc, h) => acc + h.units_sold, 0) / orderEvents.length;
      forecastedDemand = Math.max(5, Math.ceil(avgSize));
    }

    return {
      ...sku,
      history: past30Days,
      forecastedDemand,
      nextOrderDate,
    };
  });

  // Setup LP Solver model
  const variables: Record<string, any> = {};
  const ints: Record<string, 1> = {};
  
  skusWithData.forEach(sku => {
    variables[`sku_${sku.id}`] = {
      margin: sku.margin,
      cost: sku.cost,
      [`demand_${sku.id}`]: 1
    };
    ints[`sku_${sku.id}`] = 1;
  });
  
  const constraints: Record<string, any> = {
    cost: { max: distributor.credit_limit }
  };
  
  skusWithData.forEach(sku => {
    constraints[`demand_${sku.id}`] = { max: sku.forecastedDemand * 3 }; // Propose 3-day buffer
  });

  const model = {
    optimize: 'margin',
    opType: 'max' as const,
    constraints,
    variables,
    ints
  };

  const results: any = solver.Solve(model);
  
  const orderRecommendations = skusWithData.map(sku => {
    const varName = `sku_${sku.id}`;
    const recommendedQty = results[varName] || sku.forecastedDemand * 2;
    return {
      skuId: sku.id,
      name: sku.name,
      recommendedQty,
      projectedCost: recommendedQty * sku.cost,
      projectedMargin: recommendedQty * sku.margin
    };
  });

  const totalCost = orderRecommendations.reduce((sum, r) => sum + r.projectedCost, 0);
  const totalMargin = orderRecommendations.reduce((sum, r) => sum + r.projectedMargin, 0);

  return NextResponse.json({
    distributor,
    skus: skusWithData,
    optimization: {
      feasible: results.feasible ?? true,
      orderRecommendations,
      totalCost,
      totalMargin,
      creditLimit: distributor.credit_limit,
      remainingCredit: Math.max(0, distributor.credit_limit - totalCost)
    }
  });
}
