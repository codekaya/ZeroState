"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import { useUserStore } from "@/lib/store";
import { ArrowLeft, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const { identitySecret, clearIdentity } = useUserStore();

  useEffect(() => {
    if (!identitySecret) {
      router.push("/register");
    }
  }, [identitySecret, router]);

  if (!identitySecret) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                clearIdentity();
                router.push("/");
              }
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <FeedbackForm onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}


