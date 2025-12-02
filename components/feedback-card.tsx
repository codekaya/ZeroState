"use client";

import { Feedback } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils";
import { ThumbsUp, MessageCircle, User } from "lucide-react";

interface FeedbackCardProps {
  feedback: Feedback;
  onUpvote: (id: string) => void;
  onReply: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const categoryColors = {
  facilities: "bg-blue-100 text-blue-800",
  food: "bg-green-100 text-green-800",
  events: "bg-purple-100 text-purple-800",
  community: "bg-pink-100 text-pink-800",
  ideas: "bg-yellow-100 text-yellow-800",
};

const categoryEmojis = {
  facilities: "🏠",
  food: "🍽️",
  events: "🎉",
  community: "👥",
  ideas: "💡",
};

const statusColors = {
  open: "outline",
  in_progress: "warning",
  resolved: "success",
} as const;

export function FeedbackCard({
  feedback,
  onUpvote,
  onReply,
  onViewDetails,
}: FeedbackCardProps) {
  return (
    <div 
      className="glass-card p-6 rounded-3xl border-0 cursor-pointer group"
      onClick={() => onViewDetails(feedback.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-3xl">{categoryEmojis[feedback.category]}</span>
          <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0 px-4 py-1 font-semibold">
            {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
          </Badge>
          <Badge 
            variant={statusColors[feedback.status]}
            className="px-4 py-1 font-semibold"
          >
            {feedback.status.replace('_', ' ')}
          </Badge>
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {formatTimeAgo(new Date(feedback.created_at))}
        </span>
      </div>
      
      <p className="text-gray-900 text-lg leading-relaxed mb-6">{feedback.content}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(feedback.id);
            }}
          >
            <ThumbsUp className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-purple-900">{feedback.upvotes}</span>
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              onReply(feedback.id);
            }}
          >
            <MessageCircle className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-blue-900">{feedback.replies?.length || 0}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
          <User className="w-4 h-4" />
          <span className="font-medium">
            {feedback.is_anonymous
              ? `Anonymous #${feedback.author_nullifier?.slice(0, 6)}`
              : feedback.author_name || "Member"}
          </span>
        </div>
      </div>
    </div>
  );
}


