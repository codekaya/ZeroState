"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { CensusCounter } from "@/components/census-counter";
import { DemographicChart } from "@/components/demographic-chart";
import { ArrowLeft, Users, TrendingUp, Activity, Loader2 } from "lucide-react";

interface CensusData {
  totalMembers: number;
  activeMembers: number;
  merkleRoot: string;
  demographics: {
    ageRanges?: { [range: string]: number };
    locations?: { [location: string]: number };
    skills?: { [skill: string]: number };
  };
  zkProof?: any;
}

interface CensusStats {
  current: CensusData;
  growth: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  activity: {
    feedbacksLast24h: number;
    repliesLast24h: number;
    upvotesLast24h: number;
  };
}

export default function CensusPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CensusStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadCensusData();
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      loadCensusData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadCensusData = async () => {
    try {
      const response = await fetch('/api/census/stats');
      if (!response.ok) throw new Error('Failed to fetch census data');
      
      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading census data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <header className="glass-card sticky top-0 z-50 border-0">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
                <span className="text-4xl">📊</span>
                <span>zk-Census</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1 ml-14 font-medium">
                Privacy-preserving population analytics
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-white/30 bg-white/20 hover:bg-white/30 text-purple-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="glass-card p-20 rounded-3xl text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading census data...</p>
          </div>
        ) : stats ? (
          <>
            {/* Live Counter */}
            <div className="mb-8">
              <CensusCounter
                totalMembers={stats.current.totalMembers}
                activeMembers={stats.current.activeMembers}
                merkleRoot={stats.current.merkleRoot}
                zkProof={stats.current.zkProof}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Growth (24h)"
                value={stats.growth.last24h > 0 ? `+${stats.growth.last24h}` : stats.growth.last24h}
                icon={TrendingUp}
                description="New members today"
              />
              <StatsCard
                title="Growth (7d)"
                value={stats.growth.last7d > 0 ? `+${stats.growth.last7d}` : stats.growth.last7d}
                icon={TrendingUp}
                description="This week"
              />
              <StatsCard
                title="Growth (30d)"
                value={stats.growth.last30d > 0 ? `+${stats.growth.last30d}` : stats.growth.last30d}
                icon={TrendingUp}
                description="This month"
              />
              <StatsCard
                title="Active Members"
                value={stats.current.activeMembers}
                icon={Users}
                description="Last 24 hours"
              />
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Feedbacks"
                value={stats.activity.feedbacksLast24h}
                icon={Activity}
                description="Last 24 hours"
              />
              <StatsCard
                title="Replies"
                value={stats.activity.repliesLast24h}
                icon={Activity}
                description="Last 24 hours"
              />
              <StatsCard
                title="Upvotes"
                value={stats.activity.upvotesLast24h}
                icon={Activity}
                description="Last 24 hours"
              />
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.current.demographics.ageRanges &&
                Object.keys(stats.current.demographics.ageRanges).length > 0 && (
                  <DemographicChart
                    title="Age Distribution"
                    data={stats.current.demographics.ageRanges}
                    color="purple"
                  />
                )}
              {stats.current.demographics.locations &&
                Object.keys(stats.current.demographics.locations).length > 0 && (
                  <DemographicChart
                    title="Locations"
                    data={stats.current.demographics.locations}
                    color="blue"
                  />
                )}
              {stats.current.demographics.skills &&
                Object.keys(stats.current.demographics.skills).length > 0 && (
                  <DemographicChart
                    title="Top Skills"
                    data={stats.current.demographics.skills}
                    color="green"
                  />
                )}
            </div>

            {/* Last Update */}
            <div className="mt-8 text-center text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className="glass-card p-12 rounded-3xl text-center">
            <p className="text-gray-600">Failed to load census data</p>
            <Button onClick={loadCensusData} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

