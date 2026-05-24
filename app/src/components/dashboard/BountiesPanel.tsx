"use client";

import { useEffect, useState } from "react";

interface Bounty {
  challengeId: string;
  bountyId: string;
  title: string;
  reward: string;
  status: "open" | "claimed" | "submitted" | "completed" | "cancelled";
  difficulty?: "easy" | "medium" | "hard";
  agentDid?: string;
  createdAt?: string;
}

export default function BountiesPanel() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBounties();
    const interval = setInterval(fetchBounties, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchBounties() {
    try {
      const res = await fetch("/api/gitlawb/bounties");
      if (res.ok) {
        const data = await res.json();
        setBounties(data);
      }
    } catch (error) {
      console.error("Failed to fetch bounties:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBounties =
    filter === "all"
      ? bounties
      : bounties.filter((b) => b.status === filter);

  const statusColors = {
    open: "bg-green-500/20 text-green-400 border-green-500/30",
    claimed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    submitted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const difficultyColors = {
    easy: "text-green-400",
    medium: "text-yellow-400",
    hard: "text-red-400",
  };

  if (loading) {
    return (
      <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gitlawb Bounties</h2>
          <p className="text-sm text-zinc-400">
            Active challenges on the marketplace
          </p>
        </div>
        <a
          href="https://gitlawb.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on Gitlawb ↗
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "open", "claimed", "submitted", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bounties List */}
      <div className="space-y-3">
        {filteredBounties.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500">
              {filter === "all"
                ? "No bounties yet. Create your first challenge!"
                : `No ${filter} bounties`}
            </p>
          </div>
        ) : (
          filteredBounties.map((bounty) => (
            <div
              key={bounty.bountyId}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {bounty.title}
                    </h3>
                    {bounty.difficulty && (
                      <span
                        className={`text-xs font-medium ${
                          difficultyColors[bounty.difficulty]
                        }`}
                      >
                        {bounty.difficulty.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-500">
                      ID: {bounty.challengeId}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-500">
                      Bounty #{bounty.bountyId}
                    </span>
                  </div>
                  {bounty.agentDid && (
                    <div className="text-xs text-zinc-600">
                      Claimed by: {bounty.agentDid.slice(0, 20)}...
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {bounty.reward}
                    </div>
                    <div className="text-xs text-zinc-500">$SCRAP</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[bounty.status]
                    }`}
                  >
                    {bounty.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800">
        <div className="p-3 bg-zinc-900/30 rounded-lg">
          <div className="text-2xl font-bold text-white">{bounties.length}</div>
          <div className="text-xs text-zinc-500">Total</div>
        </div>
        <div className="p-3 bg-zinc-900/30 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {bounties.filter((b) => b.status === "open").length}
          </div>
          <div className="text-xs text-zinc-500">Open</div>
        </div>
        <div className="p-3 bg-zinc-900/30 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">
            {bounties.filter((b) => b.status === "claimed").length}
          </div>
          <div className="text-xs text-zinc-500">Claimed</div>
        </div>
        <div className="p-3 bg-zinc-900/30 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">
            {bounties.filter((b) => b.status === "completed").length}
          </div>
          <div className="text-xs text-zinc-500">Completed</div>
        </div>
      </div>
    </div>
  );
}
