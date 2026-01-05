"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 flex items-center justify-center px-4">
      <div className="bg-black/50 border border-gray-800 rounded-2xl px-6 py-5 shadow-xl text-center space-y-2">
        <div className="text-sm text-gray-400">Stats has moved</div>
        <div className="text-lg font-semibold text-white">
          Redirecting to the unified dashboard…
        </div>
      </div>
    </div>
  );
}
