import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <nav className="relative bg-black/80 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Bitcoin Core Fees
              </h1>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/stats"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Analytics
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium mb-8 animate-pulse">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-ping"></div>
            Live Bitcoin Network Data
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Mempool-Based
            </span>
            <br />
            <span className="text-white">Fee Estimation</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Revolutionary Bitcoin fee estimation using{" "}
            <span className="text-yellow-400 font-semibold">
              real-time mempool data
            </span>{" "}
            instead of outdated historical averages.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/dashboard"
              className="group relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-yellow-500/25"
            >
              <span className="relative z-10">View Live Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/stats"
              className="group border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:border-yellow-400 backdrop-blur-sm"
            >
              <span className="relative z-10">Detailed Analytics</span>
            </Link>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="mt-24 grid md:grid-cols-2 gap-8">
          <div className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-white">
                  Current Bitcoin Core
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Uses{" "}
                <span className="text-red-400 font-semibold">
                  historical data
                </span>{" "}
                from past blocks. Can be slow to adapt to changing network
                conditions and often overestimates fees.
              </p>
              <div className="mt-4 text-sm text-red-400 font-medium">
                ⚠️ 29.46% overpayment rate
              </div>
            </div>
          </div>

          <div className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-bold text-yellow-400">
                  Mempool-Based Method
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Analyzes{" "}
                <span className="text-yellow-400 font-semibold">
                  current mempool state
                </span>{" "}
                in real-time for more accurate and responsive fee estimates.
              </p>
              <div className="mt-4 text-sm text-green-400 font-medium">
                ✅ 80.96% accuracy rate
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Performance Metrics
          </h2>
          <p className="text-gray-400 mb-12">
            Based on 19,154 estimates from Block 832,330 to 834,362
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold text-green-400 mb-3">
                  80.96%
                </div>
                <div className="text-lg text-gray-300 mb-2">Accuracy Rate</div>
                <div className="text-sm text-green-400">
                  Within target range
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: "80.96%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold text-blue-400 mb-3">
                  0.03%
                </div>
                <div className="text-lg text-gray-300 mb-2">
                  Overpayment Rate
                </div>
                <div className="text-sm text-blue-400">vs 29.46% current</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: "0.03%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold text-yellow-400 mb-3">
                  Real-time
                </div>
                <div className="text-lg text-gray-300 mb-2">Data Updates</div>
                <div className="text-sm text-yellow-400">
                  Live mempool analysis
                </div>
                <div className="flex justify-center mt-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
