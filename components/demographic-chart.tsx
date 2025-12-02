"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DemographicChartProps {
  title: string;
  data: { [key: string]: number };
  color?: string;
  className?: string;
}

export function DemographicChart({
  title,
  data,
  color = "purple",
  className = "",
}: DemographicChartProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...entries.map(([, value]) => value), 1);

  const colorClasses = {
    purple: "bg-gradient-to-r from-purple-500 to-blue-500",
    blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
    green: "bg-gradient-to-r from-green-500 to-emerald-500",
    pink: "bg-gradient-to-r from-pink-500 to-rose-500",
  };

  return (
    <Card className={`glass-card border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No demographic data available
            </p>
          ) : (
            entries.map(([label, value]) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-600 font-semibold">{value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.purple} transition-all duration-500`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

