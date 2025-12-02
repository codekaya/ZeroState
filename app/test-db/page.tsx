"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestDBPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    error: string | null;
    details: any;
  }>({
    loading: true,
    connected: false,
    error: null,
    details: null,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus({ loading: true, connected: false, error: null, details: null });

    try {
      console.log("Testing Supabase connection...");

      // Test 1: Check if Supabase client is initialized
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Test 2: Try to query the members table
      const { data, error, count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: false })
        .limit(5);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Success!
      setStatus({
        loading: false,
        connected: true,
        error: null,
        details: {
          membersCount: count,
          sampleData: data,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
      });

      console.log("✅ Connection successful!", { data, count });
    } catch (error: any) {
      console.error("❌ Connection failed:", error);
      setStatus({
        loading: false,
        connected: false,
        error: error.message,
        details: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 glass-card border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="glass-card p-8 rounded-3xl border-0">
          <h1 className="text-3xl font-bold text-gradient mb-6">
            Database Connection Test
          </h1>

          {status.loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Testing connection to Supabase...
              </p>
            </div>
          ) : status.connected ? (
            <div className="space-y-6">
              {/* Success */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 text-lg">
                    ✅ Connection Successful!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your database is connected and working properly.
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-gray-900">Connection Details:</h4>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Supabase URL:
                  </p>
                  <p className="text-sm text-gray-600 font-mono break-all">
                    {status.details.supabaseUrl}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Members Table:
                  </p>
                  <p className="text-sm text-gray-600">
                    {status.details.membersCount} member
                    {status.details.membersCount !== 1 ? "s" : ""} found
                  </p>
                </div>

                {status.details.sampleData &&
                  status.details.sampleData.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Sample Data:
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 max-h-60 overflow-auto">
                        <pre className="text-xs text-gray-800">
                          {JSON.stringify(status.details.sampleData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>

              <Button
                onClick={() => router.push("/register")}
                className="w-full btn-primary border-0 font-bold"
              >
                Continue to Registration
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error */}
              <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-lg mb-2">
                    ❌ Connection Failed
                  </h3>
                  <p className="text-red-700 text-sm mb-3">
                    Unable to connect to your Supabase database.
                  </p>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <p className="text-xs font-mono text-red-800">
                      {status.error}
                    </p>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  🔧 Troubleshooting Steps:
                </h4>
                <ol className="space-y-2 text-sm text-yellow-800">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>
                      Check your <code className="bg-yellow-100 px-2 py-0.5 rounded">.env.local</code> file
                      has the correct Supabase URL and keys
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>
                      Make sure you ran the SQL schema from{" "}
                      <code className="bg-yellow-100 px-2 py-0.5 rounded">DATABASE.md</code>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Verify your Supabase project is active (not paused)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Restart your dev server after changing .env.local</span>
                  </li>
                </ol>
              </div>

              {/* Current Config */}
              <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                <h4 className="font-bold text-gray-900">Current Configuration:</h4>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Supabase URL:
                  </p>
                  <p className="text-sm text-gray-600 font-mono break-all">
                    {status.details.supabaseUrl || "❌ Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Anon Key:
                  </p>
                  <p className="text-sm text-gray-600">
                    {status.details.hasAnonKey ? "✅ Set" : "❌ Not set"}
                  </p>
                </div>
              </div>

              <Button
                onClick={testConnection}
                className="w-full btn-primary border-0 font-bold"
              >
                Test Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

