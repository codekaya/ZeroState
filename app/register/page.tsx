"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/lib/store";
import { getSemaphoreService } from "@/lib/semaphore";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { ZeroStateLogo } from "@/components/logo";

export default function RegisterPage() {
  const router = useRouter();
  const { setIdentity } = useUserStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // Generate ZK identity
      const semaphore = getSemaphoreService();
      const { commitment, secret } = semaphore.generateIdentity();
      
      // Register via API route (server-side MongoDB)
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          identityCommitment: commitment,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `Registration failed: ${response.status}`;
        if (errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
          alert("Email already registered!");
        } else {
          alert(`Registration failed: ${errorMessage}`);
        }
        return;
      }
      
      const { member } = await response.json();
      
      // Note: Member is already added to Semaphore group server-side
      // No need to add again client-side
      
      // Save identity locally
      setIdentity(secret, member.id, formData.name);
      
      alert(`✅ Welcome ${formData.name}! Your identity has been created securely.`);
      router.push("/");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 glass-card border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="glass-card p-10 rounded-3xl border-0 fade-in-up">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex justify-center">
              <ZeroStateLogo size={80} variant="icon" animated={true} />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-3">Welcome</h1>
            <p className="text-gray-600 text-lg">
              Create your anonymous identity with zero-knowledge proofs
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 px-5 rounded-2xl border-2 border-gray-200 focus:border-purple-500 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 px-5 rounded-2xl border-2 border-gray-200 focus:border-purple-500 text-lg"
              />
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100 rounded-2xl p-6">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Privacy Guaranteed
              </h4>
              <ul className="text-sm text-purple-800 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Your identity is stored locally on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Post feedback anonymously with cryptographic proof</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>No one can track your anonymous posts back to you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Optional: Post publicly with your name</span>
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary border-0 h-14 text-lg font-bold"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Identity...
                </>
              ) : (
                "Create My Identity"
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 font-medium">
              By registering, you agree to be a verified member of this network state.
              Your personal information is encrypted and secured.
            </p>
          </form>
        </div>

        {/* How it Works */}
        <div className="glass-card mt-8 p-8 rounded-3xl border-0 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-gradient mb-6">How It Works</h2>
          <div className="space-y-5">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-lg shadow-md">
                1
              </div>
              <div className="flex-1 pt-1">
                <h5 className="font-bold text-gray-900 text-lg mb-1">Register</h5>
                <p className="text-gray-600">We create your unique ZK identity</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-lg shadow-md">
                2
              </div>
              <div className="flex-1 pt-1">
                <h5 className="font-bold text-gray-900 text-lg mb-1">Submit Feedback</h5>
                <p className="text-gray-600">Choose anonymous or public mode</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-lg shadow-md">
                3
              </div>
              <div className="flex-1 pt-1">
                <h5 className="font-bold text-gray-900 text-lg mb-1">Stay Anonymous</h5>
                <p className="text-gray-600">Your identity is cryptographically protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


