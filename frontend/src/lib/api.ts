// API client for Bitcoin Core Fee Estimation
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export interface FeeEstimate {
  forecaster: string;
  blocks: number;
  feerate: number;
  errors?: string[];
}

export interface MempoolInfo {
  loaded: boolean;
  size: number;
  bytes: number;
  usage: number;
  total_fee: number;
  maxmempool: number;
  mempoolminfee: number;
  minrelaytxfee: number;
  incrementalrelayfee: number;
  unbroadcastcount: number;
  fullrbf: boolean;
  permitbaremultisig: boolean;
  maxdatacarriersize: number;
}

export interface BlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  chainwork: string;
  pruned: boolean;
  softforks: Record<string, unknown>;
  bip9_softforks: Record<string, unknown>;
}

export interface BlockStats {
  height: number;
  time: number;
  avgfee: number;
  avgfeerate: number;
  avgtxsize: number;
  blockhash: string;
  feerate_percentiles: [number, number, number, number, number]; // [p10, p25, p50, p75, p90]
  ins: number;
  maxfee: number;
  maxfeerate: number;
  maxtxsize: number;
  medianfee: number;
  mediantime: number;
  mediantxsize: number;
  minfee: number;
  minfeerate: number;
  mintxsize: number;
  outs: number;
  subsidy: number;
  swtotal_size: number;
  swtotal_weight: number;
  swtxs: number;
  total_out: number;
  total_size: number;
  total_weight: number;
  totalfee: number;
  txs: number;
}

export interface UnifiedEstimate {
  method: string;
  requested_method: string;
  target: number;
  percentile: number;
  fee_rate_sat_per_vb: number | null;
  components: {
    mempool?: number | null;
    historical?: number | null;
  };
  warnings?: string[];
}

export interface MempoolPercentilePoint {
  percentile: number;
  feerate_sat_per_vb: number | null;
}

export interface MempoolPercentileEstimate {
  template_height?: number;
  transactions_considered?: number;
  total_weight?: number;
  weight_limit?: number;
  percentiles: MempoolPercentilePoint[];
  warnings?: string[];
}

export interface AnalyticsSummary {
  source?: "internal" | "external";
  forecaster?: string;
  total: number;
  overpayment_val: number;
  overpayment_perc: number;
  underpayment_val: number;
  underpayment_perc: number;
  within_val: number;
  within_perc: number;
  lower_bound_label?: string;
  upper_bound_label?: string;
  window?: number;
  avg_block_coverage?: number | null;
  avg_high_fee_incl_ratio?: number | null;
}

export interface MempoolHealthBlock {
  height: number;
  p25: number | null;
  p75: number | null;
  avgFee: number | null;
  status: "overpaid" | "underpaid" | "within_range" | "unknown";
}

export interface MempoolHealthSummaryItem {
  count: number;
  percent: number;
}

export interface MempoolHealthSummary {
  overpaid: MempoolHealthSummaryItem;
  underpaid: MempoolHealthSummaryItem;
  within: MempoolHealthSummaryItem;
}

export interface MempoolHealthResponse {
  source: string;
  start_height: number;
  end_height: number;
  latest_block_height: number;
  blocks: MempoolHealthBlock[];
  summary: MempoolHealthSummary;
}

export class BitcoinCoreAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Unified estimator
  async getUnifiedEstimate(
    method: "mempool" | "historical" | "hybrid" = "mempool",
    target: number = 1,
    percentile: number = 50
  ): Promise<UnifiedEstimate> {
    const url = new URL(`${this.baseUrl}/api/v1/fees/estimate`);
    url.searchParams.set("method", method);
    url.searchParams.set("target", String(target));
    url.searchParams.set("percentile", String(percentile));
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Experimental mempool percentile estimator
  async getMempoolPercentiles(
    percentiles: number[] = [25, 50, 75]
  ): Promise<MempoolPercentileEstimate> {
    const url = new URL(`${this.baseUrl}/fees/mempool`);
    url.searchParams.set("percentiles", percentiles.join(","));
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Analytics summary for performance metrics
  async getAnalyticsSummary(limit: number = 1000): Promise<AnalyticsSummary> {
    const url = new URL(`${this.baseUrl}/analytics/summary`);
    url.searchParams.set("limit", String(limit));
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getFeeEstimate(
    target: number,
    mode: string = "economical",
    level: number = 2
  ): Promise<FeeEstimate> {
    const response = await fetch(
      `${this.baseUrl}/fees/${target}/${mode}/${level}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getMempoolInfo(): Promise<MempoolInfo> {
    const response = await fetch(`${this.baseUrl}/mempool/info`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBlockchainInfo(): Promise<BlockchainInfo> {
    const response = await fetch(`${this.baseUrl}/blockchain/info`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBlockStats(blockHeight: number): Promise<BlockStats> {
    const response = await fetch(`${this.baseUrl}/blockstats/${blockHeight}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBlockCount(): Promise<{ blockcount: number }> {
    const response = await fetch(`${this.baseUrl}/blockcount`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getHealth(): Promise<{
    status: string;
    service: string;
    rpc_connected: boolean;
    error?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getMempoolHealth(
    startHeight: number,
    interval: number = 200,
    source?: "local" | "external"
  ): Promise<MempoolHealthResponse> {
    const url = new URL(`${this.baseUrl}/analytics/mempool-health`);
    url.searchParams.set("start_height", String(startHeight));
    url.searchParams.set("interval", String(interval));
    if (source) {
      url.searchParams.set("source", source);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

// Export a default instance
export const api = new BitcoinCoreAPI();
