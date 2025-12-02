"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <div className="glass-card p-6 rounded-2xl border-0 group hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gradient mb-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 font-medium mt-2">{description}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-purple-600" />
        </div>
      </div>
    </div>
  );
}


