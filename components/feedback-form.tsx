"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FeedbackCategory, useUserStore } from "@/lib/store";
import { getSemaphoreService } from "@/lib/semaphore";
import { Loader2, Shield, User } from "lucide-react";

const categories: { value: FeedbackCategory; label: string; emoji: string }[] = [
  { value: "facilities", label: "Facilities", emoji: "🏠" },
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "events", label: "Events/Activities", emoji: "🎉" },
  { value: "community", label: "Community/Social", emoji: "👥" },
  { value: "ideas", label: "Ideas/Suggestions", emoji: "💡" },
];

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("facilities");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { identitySecret, memberId, memberName } = useUserStore();
  const charCount = content.length;
  const maxChars = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identitySecret || !memberId) {
      alert("Please register first!");
      return;
    }
    
    if (!content.trim() || content.length > maxChars) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure Semaphore group is synced with database
      const { ensureGroupSynced } = await import('@/lib/semaphore-helpers');
      await ensureGroupSynced();
      
      const semaphore = getSemaphoreService();
      const identity = semaphore.restoreIdentity(identitySecret);
      
      // Generate ZK proof
      const { proof, nullifier } = await semaphore.generateProof(
        identity,
        content
      );
      
      // Submit feedback to database
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          isAnonymous,
          authorNullifier: isAnonymous ? nullifier : null,
          authorId: isAnonymous ? null : memberId,
          zkProof: proof,
        }),
      });
      
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to submit feedback');
      }
      
      // Reset form
      setContent("");
      setCategory("facilities");
      
      alert("Feedback submitted successfully!");
      onSuccess?.();
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>✍️</span> Submit Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    category === cat.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Feedback</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxChars}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {charCount}/{maxChars} characters
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="space-y-3">
            <Label>Post as:</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isAnonymous
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Anonymous Member</div>
                    <div className="text-sm text-gray-600">
                      Verified but identity hidden
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  !isAnonymous
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{memberName || "Public"}</div>
                    <div className="text-sm text-gray-600">
                      Public feedback with your name
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!content.trim() || isSubmitting || content.length > maxChars}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Proof...
              </>
            ) : (
              <>🔒 Submit Feedback</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


