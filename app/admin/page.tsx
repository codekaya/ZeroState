"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/store";
import { Users, MessageSquare, TrendingUp, Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface FeedbackWithDetails {
  id: string;
  content: string;
  category: string;
  status: string;
  upvotes: number;
  created_at: string;
  is_anonymous: boolean;
  author_nullifier?: string;
  author_id?: string;
  author_name?: string;
  replies_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { identitySecret, isAdmin } = useUserStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackWithDetails[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFeedback: 0,
    openIssues: 0,
    avgResponseTime: "4.2h",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!identitySecret || !isAdmin) {
      router.push("/");
    } else {
      loadData();
    }
  }, [identitySecret, isAdmin, router]);

  const loadData = async () => {
    try {
      // Load feedbacks and stats in parallel
      const [feedbacksRes, statsRes] = await Promise.all([
        fetch('/api/admin/feedback'),
        fetch('/api/admin/stats'),
      ]);

      if (!feedbacksRes.ok || !statsRes.ok) throw new Error('Failed to load data');

      const { feedbacks: feedbacksData } = await feedbacksRes.json();
      const statsData = await statsRes.json();

      setFeedbacks(feedbacksData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setFeedbacks(feedbacks.map(f => 
        f.id === feedbackId ? { ...f, status: newStatus } : f
      ));

      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (!identitySecret || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔧 Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Manage feedback and monitor your network state</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            description="Verified members"
          />
          <StatsCard
            title="Total Feedback"
            value={stats.totalFeedback}
            icon={MessageSquare}
            description="All time submissions"
          />
          <StatsCard
            title="Open Issues"
            value={stats.openIssues}
            icon={TrendingUp}
            description="Needs attention"
          />
          <StatsCard
            title="Avg Response Time"
            value={stats.avgResponseTime}
            icon={Clock}
            description="Staff response rate"
          />
        </div>

        {/* Feedback Management */}
        <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading feedback...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge>{feedback.category}</Badge>
                          <Badge 
                            variant={
                              feedback.status === 'open' ? 'outline' :
                              feedback.status === 'in_progress' ? 'warning' : 'success'
                            }
                          >
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(new Date(feedback.created_at))}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(feedback.id, "in_progress")}
                            disabled={feedback.status === "in_progress"}
                          >
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(feedback.id, "resolved")}
                            disabled={feedback.status === "resolved"}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-900 mb-3">{feedback.content}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>👍 {feedback.upvotes} upvotes</span>
                          <span>💬 {feedback.replies_count} replies</span>
                        </div>
                        <span>
                          {feedback.is_anonymous
                            ? `Anonymous #${feedback.author_nullifier?.slice(0, 6)}`
                            : `Member ${feedback.author_id?.slice(0, 8)}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

