import { NextResponse } from 'next/server';
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

function generateMockHistory(skuId: number) {
  const history = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = skuId === 1 ? 25 : skuId === 2 ? 18 : skuId === 3 ? 30 : 15;
    const noise = Math.floor(Math.sin(i) * 5 + (i % 3) * 3);
    history.push({
      id: 1000 + i,
      sku_id: skuId,
      date: d.toISOString().split('T')[0],
      units_sold: Math.max(5, base + noise)
    });
  }
  return history;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

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

  // Fallback to mock data if Supabase isn't configured or data is missing
  if (!distributor) {
    distributor = MOCK_DISTRIBUTORS[id] || { id: Number(id) || 1, name: `Distributor ${id}`, credit_limit: 50000 };
    skus = MOCK_SKUS.map(s => ({ ...s, distributor_id: Number(id) || 1 }));
    historicalData = skus.flatMap(s => generateMockHistory(s.id));
  }

  // Process data for charts and ML forecast
  const skusWithData = skus.map(sku => {
    const skuHistory = historicalData
      .filter(h => h.sku_id === sku.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const last30Days = skuHistory.length > 0 ? skuHistory.slice(-30) : generateMockHistory(sku.id);
    
    let forecastedDemand = 20;
    if (last30Days.length > 0) {
      const dataPoints: [number, number][] = last30Days.map((h, idx) => [idx, h.units_sold]);
      const result = regression.linear(dataPoints);
      const prediction = result.predict(last30Days.length)[1];
      forecastedDemand = Math.max(5, Math.ceil(prediction));
    }

    return {
      ...sku,
      history: last30Days,
      forecastedDemand,
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
