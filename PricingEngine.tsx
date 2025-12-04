import { useState } from 'react';

export default function PricingEngine() {
  const [basePrice, setBasePrice] = useState(100000);
  const [markup, setMarkup] = useState(15);
  const [years, setYears] = useState(3);
  const [escalation] = useState(3);

  const calculatePricing = () => {
    const primeBase = basePrice * (1 + markup / 100);
    const yearPrices = [primeBase];
    
    for (let i = 1; i < years; i++) {
      yearPrices.push(yearPrices[i - 1] * (1 + escalation / 100));
    }
    
    return yearPrices;
  };

  const prices = calculatePricing();
  const totalValue = prices.reduce((sum, p) => sum + p, 0);

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Pricing Inputs</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcontractor Base Price</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Markup %</label>
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Years</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              min="1"
              max="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Calculated Pricing</h2>
        <div className="space-y-3">
          {prices.map((price, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">
                {i === 0 ? 'Base Year' : `Option Year ${i}`}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
            <span className="font-bold text-gray-900 text-lg">Total Contract Value</span>
            <span className="text-3xl font-bold text-blue-600">
              ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
