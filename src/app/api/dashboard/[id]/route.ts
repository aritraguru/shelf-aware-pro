import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import solver from 'javascript-lp-solver';
import regression from 'regression';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // Fetch distributor
  const { data: distributor, error: distError } = await supabase
    .from('distributors_new')
    .select('*')
    .eq('id', id)
    .single();

  if (distError || !distributor) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
  }

  // Fetch SKUs
  const { data: skus, error: skusError } = await supabase
    .from('skus_new')
    .select('*')
    .eq('distributor_id', id);

  if (skusError || !skus) {
    return NextResponse.json({ error: 'SKUs not found' }, { status: 404 });
  }

  // Fetch Historical Data
  const skuIds = skus.map(s => s.id);
  const { data: historicalData, error: histError } = await supabase
    .from('historical_data_new')
    .select('*')
    .in('sku_id', skuIds);

  if (histError || !historicalData) {
    return NextResponse.json({ error: 'Historical data not found' }, { status: 404 });
  }

  // Process data for charts and ML forecast
  const skusWithData = skus.map(sku => {
    const skuHistory = historicalData
      .filter(h => h.sku_id === sku.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const last30Days = skuHistory.slice(-30);
    
    let forecastedDemand = 0;
    if (last30Days.length > 0) {
      // Use ML Linear Regression for Forecasting instead of Simple Moving Average
      // Map data to [x, y] coordinates where x is the day index and y is the units sold
      const dataPoints: [number, number][] = last30Days.map((h, idx) => [idx, h.units_sold]);
      
      const result = regression.linear(dataPoints);
      
      // Predict demand for tomorrow (day index = last30Days.length)
      const prediction = result.predict(last30Days.length)[1];
      
      // Ensure we don't predict negative demand, and round up to whole units
      forecastedDemand = Math.max(0, Math.ceil(prediction));
    }

    return {
      ...sku,
      history: last30Days,
      forecastedDemand,
    };
  });

  // Setup LP Solver model
  // Objective: Maximize margin
  // Constraints: Total Cost <= Credit Limit
  // For each SKU: order quantity <= forecasted_demand
  
  const variables: Record<string, any> = {};
  const ints: Record<string, 1> = {};
  
  skusWithData.forEach(sku => {
    variables[`sku_${sku.id}`] = {
      margin: sku.margin,
      cost: sku.cost,
      [`demand_${sku.id}`]: 1 // constraint key
    };
    ints[`sku_${sku.id}`] = 1; // Integer variable
  });
  
  const constraints: Record<string, any> = {
    cost: { max: distributor.credit_limit }
  };
  
  skusWithData.forEach(sku => {
    constraints[`demand_${sku.id}`] = { max: sku.forecastedDemand };
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
    const recommendedQty = results[varName] || 0;
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
      feasible: results.feasible,
      orderRecommendations,
      totalCost,
      totalMargin,
      creditLimit: distributor.credit_limit,
      remainingCredit: distributor.credit_limit - totalCost
    }
  });
}
