"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackCard } from "@/components/feedback-card";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Feedback, FeedbackCategory, useFeedbackStore, useUserStore } from "@/lib/store";
import { getSemaphoreService } from "@/lib/semaphore";
import { MessageSquare, TrendingUp, Clock, CheckCircle, Plus, Shield, UserCircle, BarChart3 } from "lucide-react";
import Link from "next/link";

const categories: { value: FeedbackCategory | 'all'; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "📋" },
  { value: "facilities", label: "Facilities", emoji: "🏠" },
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "events", label: "Events", emoji: "🎉" },
  { value: "community", label: "Community", emoji: "👥" },
  { value: "ideas", label: "Ideas", emoji: "💡" },
];

export default function HomePage() {
  const router = useRouter();
  const { feedbacks, setFeedbacks, selectedCategory, setSelectedCategory } = useFeedbackStore();
  const { identitySecret, memberName, isAdmin } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    avgResponseTime: "4.2h",
    satisfaction: "89%",
  });

  useEffect(() => {
    loadFeedbacks();
  }, [selectedCategory]);

  const loadFeedbacks = async () => {
    try {
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const url = category 
        ? `/api/feedback?category=${category}`
        : '/api/feedback';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      
      const { feedbacks } = await response.json();
      setFeedbacks(feedbacks as Feedback[]);
      
      // Calculate stats
      const total = feedbacks.length;
      const open = feedbacks.filter((f: Feedback) => f.status === 'open').length;
      setStats({
        total,
        open,
        avgResponseTime: "4.2h",
        satisfaction: "89%",
      });
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedbacks = selectedCategory === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.category === selectedCategory);

  const handleUpvote = async (id: string) => {
    if (!identitySecret) {
      alert("Please register first!");
      return;
    }
    
    try {
      // Ensure Semaphore group is synced
      const { ensureGroupSynced } = await import('@/lib/semaphore-helpers');
      await ensureGroupSynced();
      
      const semaphore = getSemaphoreService();
      const identity = semaphore.restoreIdentity(identitySecret);
      const { nullifier } = await semaphore.generateProof(identity, `upvote-${id}`);
      
      const response = await fetch(`/api/feedback/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier }),
      });
      
      if (!response.ok) {
        const { error } = await response.json();
        alert(error || 'Failed to upvote');
        return;
      }
      
      // Reload feedbacks to show updated count
      loadFeedbacks();
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to upvote');
    }
  };

  const handleReply = (id: string) => {
    router.push(`/feedback/${id}`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/feedback/${id}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-0">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
                <span className="text-4xl">🔒</span>
                <span>ZeroState</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1 ml-14 font-medium">Anonymous Feedback Forum</p>
            </div>
            
            <div className="flex items-center gap-4">
              {identitySecret ? (
                <>
                  <div className="glass-card px-4 py-2 rounded-full border-0">
                    <p className="text-sm font-semibold text-gray-900">{memberName}</p>
                    <p className="text-xs text-purple-600 font-medium">✓ Verified</p>
                  </div>
                  <Button
                    onClick={() => router.push("/submit")}
                    className="btn-primary border-0 font-semibold"
                    size="lg"
                  >
                    <Plus className="w-4 h-4" />
                    New Feedback
                  </Button>
                  <Button
                    onClick={() => router.push("/census")}
                    variant="outline"
                    className="border-white/30 bg-white/20 hover:bg-white/30 text-purple-700 font-semibold"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Census
                  </Button>
                  {identitySecret && (
                    <Button
                      onClick={() => router.push("/passport")}
                      variant="outline"
                      className="border-white/30 bg-white/20 hover:bg-white/30 text-purple-700 font-semibold"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Passport
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      onClick={() => router.push("/admin")}
                      variant="outline"
                      className="border-white/30 bg-white/20 hover:bg-white/30 text-purple-700 font-semibold"
                    >
                      Admin
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={() => router.push("/register")} className="btn-primary border-0 font-semibold px-8" size="lg">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 fade-in-up">
          <StatsCard
            title="Total Feedback"
            value={stats.total}
            icon={MessageSquare}
            description="All time submissions"
          />
          <StatsCard
            title="Open Issues"
            value={stats.open}
            icon={TrendingUp}
            description="Needs attention"
          />
          <StatsCard
            title="Avg Response Time"
            value={stats.avgResponseTime}
            icon={Clock}
            description="Staff response rate"
          />
          <StatsCard
            title="Satisfaction"
            value={stats.satisfaction}
            icon={CheckCircle}
            description="Member happiness"
          />
        </div>

        {/* Live Census Widget */}
        <div className="mb-12 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link href="/census" className="block">
            <div className="glass-card p-6 rounded-3xl border-0 hover:scale-[1.02] transition-transform cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Live zk-Census</h3>
                    <p className="text-sm text-gray-600">Real-time population count with ZK proofs</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gradient">→</div>
                  <p className="text-xs text-gray-500 mt-1">View Dashboard</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        {!identitySecret && (
          <div className="glass-card mb-12 p-8 rounded-3xl border-0 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Join the Conversation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Register to submit feedback anonymously or publicly. Your identity is protected by zero-knowledge proofs.
                </p>
              </div>
              <Button onClick={() => router.push("/register")} className="btn-primary border-0 font-semibold px-8 py-6 text-lg whitespace-nowrap">
                <Shield className="w-5 h-5" />
                Register Now
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, idx) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value as any)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap font-semibold ${
                  selectedCategory === cat.value
                    ? "glass-card border-0 shadow-lg"
                    : "bg-white/60 hover:bg-white/80 border border-white/30"
                }`}
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className={selectedCategory === cat.value ? "text-gradient" : "text-gray-700"}>
                  {cat.label}
                </span>
                <Badge 
                  variant={selectedCategory === cat.value ? "default" : "secondary"} 
                  className={`ml-1 ${selectedCategory === cat.value ? "bg-gradient-to-r from-purple-600 to-blue-600 border-0" : ""}`}
                >
                  {cat.value === 'all' 
                    ? feedbacks.length 
                    : feedbacks.filter(f => f.category === cat.value).length}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-5">
          {isLoading ? (
            <div className="glass-card p-20 rounded-3xl text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium text-lg">Loading feedback...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="glass-card p-16 rounded-3xl text-center border-0">
              <div className="text-6xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No feedback yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Be the first to share your thoughts!
              </p>
              {identitySecret && (
                <Button onClick={() => router.push("/submit")} className="btn-primary border-0 font-semibold px-8 py-6 text-lg">
                  Submit First Feedback
                </Button>
              )}
            </div>
          ) : (
            filteredFeedbacks.map((feedback, idx) => (
              <div key={feedback.id} className="fade-in-up" style={{ animationDelay: `${0.4 + idx * 0.05}s` }}>
                <FeedbackCard
                  feedback={feedback}
                  onUpvote={handleUpvote}
                  onReply={handleReply}
                  onViewDetails={handleViewDetails}
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
