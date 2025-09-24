"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Simple mempool data interface
interface MempoolData {
  feeRate: number; // s/vb
  mempoolSize: number;
  totalFees: number;
  blockHeight: number;
  lastUpdate: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<MempoolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setData({
          feeRate: 5.2,
          mempoolSize: 103733,
          totalFees: 0.1086,
          blockHeight: 834362,
          lastUpdate: new Date().toLocaleTimeString(),
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="relative bg-black/80 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
              >
                Bitcoin Core Fees
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/stats"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Analytics
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium mb-6 animate-pulse">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-ping"></div>
            Live Mempool Data
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Mempool Fee Estimation
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time fee rates based on{" "}
            <span className="text-yellow-400 font-semibold">
              current mempool state
            </span>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Block Template Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Main Fee Forecast Block */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">
                  100 Forecast by Mempool Forecaster
                </h3>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl transform translate-x-1 translate-y-1 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-8 text-black shadow-2xl group-hover:shadow-yellow-500/25 transition-all duration-300 group-hover:scale-105">
                    <div className="text-center space-y-3">
                      <div className="text-3xl font-bold">
                        {data?.feeRate.toFixed(1)} s/vb
                      </div>
                      <div className="text-xl opacity-90">
                        {data?.feeRate.toFixed(1)} s/vb
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Minimum Relay Fee Rate - 1 s/vb
                </div>
              </div>

              {/* KWU Block Templates */}
              {[100, 99, 98].map((blockNum, index) => (
                <div key={blockNum} className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    {blockNum}
                  </h3>
                  <div className="relative group">
                    {/* Background block (target capacity) */}
                    <div className="absolute inset-0 bg-gray-800 rounded-xl transform translate-x-2 translate-y-2 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

                    {/* Foreground block (current usage) */}
                    <div className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-black shadow-2xl group-hover:shadow-yellow-500/25 transition-all duration-300 group-hover:scale-105">
                      {/* Liquid fill effect */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-xl transition-all duration-1000"
                        style={{
                          height: `${100 - (85 + index * 5)}%`,
                          opacity: 0.3,
                        }}
                      ></div>

                      <div className="relative z-10 text-center">
                        <div className="text-sm opacity-75 mb-2">3.8 KWU</div>
                        <div className="text-xl font-bold">
                          {(3.6 - index * 0.1).toFixed(1)} KWU
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-sm text-gray-400 mb-2">Mempool Size</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {data?.mempoolSize.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">transactions</div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-sm text-gray-400 mb-2">Total Fees</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {data?.totalFees.toFixed(4)} BTC
                  </div>
                  <div className="text-xs text-gray-500">in mempool</div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-sm text-gray-400 mb-2">Block Height</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {data?.blockHeight.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">latest block</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            How Mempool-Based Fee Estimation Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative bg-gray-800/50 rounded-xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h4 className="text-lg font-semibold text-white">
                  Current Method (Bitcoin Core)
                </h4>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Uses{" "}
                <span className="text-red-400 font-semibold">
                  historical data
                </span>{" "}
                from past blocks to estimate fees. Can be slow to adapt to
                changing conditions.
              </p>
            </div>
            <div className="group relative bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <h4 className="text-lg font-semibold text-yellow-400">
                  Mempool-Based Method
                </h4>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Analyzes{" "}
                <span className="text-yellow-400 font-semibold">
                  current mempool state
                </span>{" "}
                in real-time to provide more accurate fee estimates for
                immediate use.
              </p>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="mt-8 flex items-center justify-center space-x-3 text-gray-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">
            Live data • Last updated: {data?.lastUpdate}
          </span>
        </div>
      </main>
    </div>
  );
}
