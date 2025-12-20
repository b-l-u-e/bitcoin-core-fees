"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface MempoolForecastData {
  forecast: {
    feeRate: number; // in s/vb
    mode: string; // "economical" or "conservative"
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
            mode: "economical",
          },
          blockWeights: mockBlockWeights,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        // Fallback mock data
        setData({
          forecast: {
            feeRate: 5,
            mode: "economical",
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
      <div className="flex items-center justify-center h-40 text-[#cc7400]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cc7400]"></div>
      </div>
    );
  }

  if (error && !data) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-[#0f1115] border border-gray-800 rounded-2xl text-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#cc7400] text-black rounded-xl p-5 shadow-lg">
          <div className="text-sm font-semibold">Forecast (mempool)</div>
          <div className="text-3xl font-bold mt-2">
            {data?.forecast.feeRate.toFixed(1)} sat/vB
          </div>
          <div className="text-xs opacity-80 mt-1">
            Mode: {data?.forecast.mode}
          </div>
        </div>

        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-2">Blocks sampled</div>
          <div className="flex gap-3">
            {data?.blockWeights.slice(0, 3).map((block, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="text-xs text-gray-400 mb-1">
                  {idx === 0 ? "Current" : `Next ${idx}`}
                </div>
                <div className="text-lg font-bold text-[#cc7400]">
                  {block.current.toFixed(1)} KWU
                </div>
                <div className="text-[11px] text-gray-400">
                  {block.utilization}% full
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
