"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Feedback, Reply, useUserStore } from "@/lib/store";
import { getSemaphoreService } from "@/lib/semaphore";
import { formatTimeAgo } from "@/lib/utils";
import { ArrowLeft, User, Shield, ThumbsUp, Send, Loader2 } from "lucide-react";

const categoryEmojis = {
  facilities: "🏠",
  food: "🍽️",
  events: "🎉",
  community: "👥",
  ideas: "💡",
};

export default function FeedbackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id as string;
  
  const { identitySecret, memberId, memberName } = useUserStore();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isAnonymousReply, setIsAnonymousReply] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbackDetails();
  }, [feedbackId]);

  const loadFeedbackDetails = async () => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const { feedback: feedbackData, replies: repliesData } = await response.json();
      setFeedback(feedbackData as Feedback);
      setReplies(repliesData as Reply[]);
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
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

      // Generate unique nullifier for this upvote
      const { nullifier } = await semaphore.generateProof(identity, `upvote-${feedbackId}`);

      const response = await fetch(`/api/feedback/${feedbackId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        alert(error || 'Failed to upvote');
        return;
      }

      // Reload to see updated count
      loadFeedbackDetails();
      alert("Upvoted!");
    } catch (error) {
      console.error("Error upvoting:", error);
      alert("Failed to upvote");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identitySecret || !replyContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure Semaphore group is synced
      const { ensureGroupSynced } = await import('@/lib/semaphore-helpers');
      await ensureGroupSynced();
      
      const semaphore = getSemaphoreService();
      const identity = semaphore.restoreIdentity(identitySecret);

      // Generate ZK proof for reply
      const { proof, nullifier } = await semaphore.generateProof(identity, replyContent);

      // Submit reply
      const response = await fetch(`/api/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          isAnonymous: isAnonymousReply,
          authorNullifier: isAnonymousReply ? nullifier : null,
          authorId: isAnonymousReply ? null : memberId,
          zkProof: proof,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to submit reply');
      }

      // Reset form
      setReplyContent("");
      
      // Reload replies
      loadFeedbackDetails();
      alert("Reply submitted!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Feedback not found
            </h3>
            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Main Feedback */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryEmojis[feedback.category]}</span>
                <Badge>{feedback.category}</Badge>
                <Badge variant={
                  feedback.status === 'open' ? 'outline' :
                  feedback.status === 'in_progress' ? 'warning' : 'success'
                }>
                  {feedback.status.replace('_', ' ')}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">
                {formatTimeAgo(new Date(feedback.created_at))}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-lg text-gray-900">{feedback.content}</p>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleUpvote}
                className="flex items-center gap-2"
                disabled={!identitySecret}
              >
                <ThumbsUp className="w-4 h-4" />
                {feedback.upvotes} Upvotes
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {feedback.is_anonymous ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Anonymous Member #{feedback.author_nullifier?.slice(0, 6)}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    {feedback.author_name || "Member"}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Replies ({replies.length})
          </h3>

          {replies.map((reply) => (
            <Card key={reply.id} className="ml-8">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {reply.is_anonymous ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Anonymous Member #{reply.author_nullifier?.slice(0, 6)}
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        {reply.author_name || "Member"}
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(new Date(reply.created_at))}
                  </span>
                </div>
                <p className="text-gray-900">{reply.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {identitySecret ? (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Add Reply</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reply">Your Reply</Label>
                  <Textarea
                    id="reply"
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    maxLength={300}
                    rows={3}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {replyContent.length}/300 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reply as:</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAnonymousReply(true)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        isAnonymousReply
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Anonymous</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsAnonymousReply(false)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        !isAnonymousReply
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{memberName}</span>
                      </div>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Reply
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Register to Reply
              </h3>
              <p className="text-gray-600 mb-4">
                Create your anonymous identity to participate in the conversation
              </p>
              <Button onClick={() => router.push("/register")}>
                Register Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

