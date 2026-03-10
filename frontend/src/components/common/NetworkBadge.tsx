"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";

interface NetworkBadgeProps {
  className?: string;
}

export function NetworkBadge({ className = "" }: NetworkBadgeProps) {
  const [network, setNetwork] = useState<string>("MAINNET");

  useEffect(() => {
    api.getBlockCount()
      .then((info) => { if (info.chain_display) setNetwork(info.chain_display); })
      .catch(() => {});
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] text-[10px] font-mono uppercase tracking-widest shadow-sm ${className}`.trim()}>
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      NETWORK: {network}
    </div>
  );
}
