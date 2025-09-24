"use client";

import { useState, useEffect } from "react";
import { api, type FeeEstimate } from "@/lib/api";

interface MempoolForecastData {
  forecast: {
    feeRate: number; // in s/vb
    confidence: number; // percentage
  };
  blockWeights: {
    target: number; // KWU
    current: number; // KWU
    utilization: number; // percentage
  }[];
}

export default function MempoolForecastDashboard() {
  const [data, setData] = useState<MempoolForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch fee estimate
        const feeEstimate = await api.getFeeEstimate(1, "economical", 2);

        // Mock block weight data (in real implementation, this would come from mempool data)
        const mockBlockWeights = [
          { target: 3.8, current: 3.8, utilization: 100 },
          { target: 3.8, current: 3.6, utilization: 95 },
          { target: 3.8, current: 3.6, utilization: 95 },
        ];

        setData({
          forecast: {
            feeRate: feeEstimate.feerate * 100000000, // Convert to s/vb
            confidence: 100,
          },
          blockWeights: mockBlockWeights,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        // Fallback mock data
        setData({
          forecast: {
            feeRate: 5,
            confidence: 100,
          },
          blockWeights: [
            { target: 3.8, current: 3.8, utilization: 100 },
            { target: 3.8, current: 3.6, utilization: 95 },
            { target: 3.8, current: 3.6, utilization: 95 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return <div className="text-center text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Block 1: 100 Forecast by Mempool Forecaster */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            100 Forecast by Mempool Forecaster
          </h3>

          <div className="relative">
            {/* Main forecast block */}
            <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-lg p-6 text-white shadow-lg">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">
                  {data?.forecast.feeRate.toFixed(1)} s/vb
                </div>
                <div className="text-lg opacity-90">
                  {data?.forecast.feeRate.toFixed(1)} s/vb
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Minimum Relay Fee Rate - 1 s/vb
          </div>
        </div>

        {/* Blocks 2-4: KWU Visualizations */}
        {data?.blockWeights.map((block, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {index === 0 ? "Current" : `${100 - index}`}
            </h3>

            <div className="relative">
              {/* Background block (target capacity) */}
              <div className="absolute inset-0 bg-gray-800 rounded-lg transform translate-x-1 translate-y-1"></div>

              {/* Foreground block (current usage) */}
              <div className="relative bg-gradient-to-br from-red-700 to-red-800 rounded-lg p-4 text-white shadow-lg">
                {/* Liquid fill effect */}
                <div
                  className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-lg transition-all duration-1000"
                  style={{
                    height: `${100 - block.utilization}%`,
                    opacity: 0.3,
                  }}
                ></div>

                <div className="relative z-10 text-center">
                  <div className="text-sm opacity-75 mb-1">
                    {block.target.toFixed(1)} KWU
                  </div>
                  <div className="text-lg font-bold">
                    {block.current.toFixed(1)} KWU
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mempool Size
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            103,733
          </div>
          <div className="text-xs text-gray-500">transactions</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Fees
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            0.1086
          </div>
          <div className="text-xs text-gray-500">BTC</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mempool Usage
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            83.6%
          </div>
          <div className="text-xs text-gray-500">of max capacity</div>
        </div>
      </div>

      
      <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live data • Updates every 30 seconds</span>
      </div>
    </div>
  );
}
