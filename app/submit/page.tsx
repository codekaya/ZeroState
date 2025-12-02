"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import { useUserStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function SubmitPage() {
  const router = useRouter();
  const { identitySecret } = useUserStore();

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
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <FeedbackForm onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}


