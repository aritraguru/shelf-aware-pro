export default function OptimizationPanel({ optimization }: { optimization: any }) {
  if (!optimization) return null;

  return (
    <div className="bg-brand-navy text-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
        AI Optimization
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center border-b border-brand-navy-dark pb-2">
          <span className="text-gray-400">Status</span>
          <span className={`font-medium ${optimization.feasible ? 'text-brand-teal-light' : 'text-red-400'}`}>
            {optimization.feasible ? 'Feasible' : 'Infeasible'}
          </span>
        </div>
        
        <div className="flex justify-between items-center border-b border-brand-navy-dark pb-2">
          <span className="text-gray-400">Total Projected Margin</span>
          <span className="font-semibold text-xl text-brand-teal-light">
            ${optimization.totalMargin.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center pb-2">
          <span className="text-gray-400">Credit Used</span>
          <span className="font-medium">
            ${optimization.totalCost.toLocaleString()} / ${optimization.creditLimit.toLocaleString()}
          </span>
        </div>
      </div>

      <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3 font-medium">Order Recommendations</h3>
      <ul className="space-y-3">
        {optimization.orderRecommendations.map((rec: any) => (
          <li key={rec.skuId} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{rec.name}</p>
              <p className="text-xs text-brand-teal-light pt-0.5">Margin: ${rec.projectedMargin.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="bg-brand-teal text-brand-navy font-bold px-2 py-1 rounded text-sm">
                {rec.recommendedQty} units
              </span>
            </div>
          </li>
        ))}
        {optimization.orderRecommendations.length === 0 && (
          <p className="text-sm text-gray-400 italic">No recommendations available.</p>
        )}
      </ul>
      
      <button className="w-full mt-8 bg-brand-teal hover:bg-brand-teal-light text-brand-navy font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98]">
        Submit Order
      </button>
    </div>
  );
}
