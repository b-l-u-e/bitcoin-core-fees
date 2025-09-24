"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api, type FeeEstimate } from "@/lib/api";
import BlockTemplateVisualization from "@/app/components/BlockTemplateVisualization";

export default function StatsPage() {
  const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState(1);
  const [blockHeight, setBlockHeight] = useState(800000);

  const fetchFeeEstimate = async (confTarget: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFeeEstimate(confTarget, "economical", 2);
      setFeeEstimate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeEstimate(target);
  }, [target]);

  const formatFeeRate = (feerate: number) => {
    return `${(feerate * 100000000).toFixed(2)} sat/vB`;
  };

  const getStatusColor = (hasErrors: boolean) => {
    return hasErrors
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400";
  };

  const getStatusText = (hasErrors: boolean) => {
    return hasErrors ? "Issues Detected" : "Working Properly";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className=" bg-black/80 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
              >
                Bitcoin Core Fee Estimation
              </Link>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium mb-6 animate-pulse">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-ping"></div>
            Live Analytics Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Live Fee Estimation
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time Bitcoin fee estimation using{" "}
            <span className="text-yellow-400 font-semibold">
              current mempool data
            </span>
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmation Target (blocks)
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value={1}>1 block (~10 minutes)</option>
                <option value={2}>2 blocks (~20 minutes)</option>
                <option value={3}>3 blocks (~30 minutes)</option>
                <option value={6}>6 blocks (~1 hour)</option>
                <option value={12}>12 blocks (~2 hours)</option>
                <option value={24}>24 blocks (~4 hours)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Block Height for Analysis
              </label>
              <input
                type="number"
                value={blockHeight}
                onChange={(e) => setBlockHeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="800000"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchFeeEstimate(target)}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {loading ? "Loading..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !feeEstimate && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading fee estimation...
              </span>
            </div>
          </div>
        )}

        {/* Fee Estimation Results */}
        {feeEstimate && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Current Fee Estimate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Current Fee Estimate
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fee Rate:
                  </span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatFeeRate(feeEstimate.feerate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Forecaster:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {feeEstimate.forecaster}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Blocks:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {feeEstimate.blocks}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`font-semibold ${getStatusColor(
                      feeEstimate.errors && feeEstimate.errors.length > 0
                    )}`}
                  >
                    {getStatusText(
                      feeEstimate.errors && feeEstimate.errors.length > 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Issues/Errors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                System Status
              </h2>
              {feeEstimate.errors && feeEstimate.errors.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      Issues Detected
                    </span>
                  </div>
                  {feeEstimate.errors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                    >
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {error}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    System Working Properly
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mempool-Based Estimation Demo */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 rounded-xl p-8 border border-orange-200 dark:border-orange-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Mempool-Based Estimation Preview
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Current System Issues
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• "Mempool is unreliable for fee rate forecasting"</li>
                <li>• Based on historical data, not current conditions</li>
                <li>• Slow to react to network changes</li>
                <li>• High overpayment rates (29.46%)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Mempool-Based Solution
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Real-time mempool analysis</li>
                <li>• 50th percentile fee rate estimation</li>
                <li>• Responsive to current network conditions</li>
                <li>• Dramatically reduced overpayment (0.03%)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Block Template Visualization */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Block Template Analysis
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            See how mempool-based fee estimation works by analyzing actual block
            data
          </p>
          <BlockTemplateVisualization blockHeight={blockHeight} />
        </div>

        {/* Performance Comparison */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Performance Comparison
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current System
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Overpaid:
                  </span>
                  <span className="text-red-600 font-bold">29.46%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Within Range:
                  </span>
                  <span className="text-gray-600 font-bold">59.50%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: "29.46%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-700">
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">
                Mempool-Based
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Overpaid:
                  </span>
                  <span className="text-green-600 font-bold">0.05%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Within Range:
                  </span>
                  <span className="text-green-600 font-bold">80.96%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "80.96%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                With Threshold
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Overpaid:
                  </span>
                  <span className="text-green-600 font-bold">0.03%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Within Range:
                  </span>
                  <span className="text-green-600 font-bold">73.50%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "73.50%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
