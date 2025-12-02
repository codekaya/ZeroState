"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, MapPin, Code, Calendar } from "lucide-react";

interface PassportCardProps {
  memberName: string;
  identityCommitment: string;
  attributes: {
    skills?: string[];
    location?: string;
    ageRange?: string;
    [key: string]: any;
  };
  groups: string[];
  createdAt: string;
  verified: boolean;
}

export function PassportCard({
  memberName,
  identityCommitment,
  attributes,
  groups,
  createdAt,
  verified,
}: PassportCardProps) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gradient">
            zk-Passport
          </CardTitle>
          {verified && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Identity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Identity</h3>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-bold text-gray-900 text-lg">{memberName}</p>
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
              {identityCommitment.slice(0, 32)}...
            </p>
          </div>
        </div>

        {/* Groups */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Groups</h3>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge key={group} variant="secondary" className="px-3 py-1">
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {/* Attributes */}
        {(attributes.skills?.length || attributes.location || attributes.ageRange) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Attributes</h3>
            <div className="space-y-3">
              {attributes.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">{attributes.location}</span>
                </div>
              )}
              {attributes.ageRange && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">{attributes.ageRange}</span>
                </div>
              )}
              {attributes.skills && attributes.skills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {attributes.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-purple-200 text-purple-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ZK Proof Badge */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Zero-knowledge proof verified</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Member since {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

