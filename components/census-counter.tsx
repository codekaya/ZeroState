"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CensusCounterProps {
  totalMembers: number;
  activeMembers: number;
  merkleRoot?: string;
  zkProof?: any;
  className?: string;
}

export function CensusCounter({
  totalMembers,
  activeMembers,
  merkleRoot,
  zkProof,
  className = "",
}: CensusCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animate counter
    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = totalMembers / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.floor(increment * step), totalMembers);
      setDisplayCount(current);

      if (step >= steps) {
        setDisplayCount(totalMembers);
        setIsAnimating(false);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalMembers]);

  return (
    <div className={`glass-card p-8 rounded-3xl border-0 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Live Population</h3>
            <p className="text-sm text-gray-600">ZK-verified member count</p>
          </div>
        </div>
        {zkProof && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={displayCount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-5xl font-bold text-gradient"
              >
                {displayCount.toLocaleString()}
              </motion.span>
            </AnimatePresence>
            <span className="text-2xl text-gray-500 font-semibold">members</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {activeMembers} active in last 24 hours
          </p>
        </div>

        {merkleRoot && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span className="font-mono truncate">Merkle Root: {merkleRoot.slice(0, 16)}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

