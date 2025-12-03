"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PassportCard } from "@/components/passport-card";
import { useUserStore } from "@/lib/store";
import { ArrowLeft, Loader2, Edit, Save, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PassportData {
  memberId: string;
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
}

export default function PassportPage() {
  const router = useRouter();
  const { memberId, memberName, identitySecret, clearIdentity } = useUserStore();
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState({
    skills: [] as string[],
    location: '',
    ageRange: '',
  });

  useEffect(() => {
    if (!memberId || !identitySecret) {
      router.push('/register');
      return;
    }
    loadPassport();
  }, [memberId, identitySecret, router]);

  const loadPassport = async () => {
    if (!memberId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/passport/${memberId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to load passport: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.passport) {
        throw new Error('Passport data not found in response');
      }

      const passportData = data.passport;
      setPassport(passportData);
      setEditedAttributes({
        skills: passportData.attributes?.skills || [],
        location: passportData.attributes?.location || '',
        ageRange: passportData.attributes?.ageRange || '',
      });
    } catch (error: any) {
      console.error('Error loading passport:', error);
      // Show user-friendly error
      alert(`Failed to load passport: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!memberId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/passport/${memberId}/attributes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            skills: editedAttributes.skills.filter((s) => s.trim()),
            location: editedAttributes.location.trim(),
            ageRange: editedAttributes.ageRange.trim(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to save: ${response.status}`);
      }

      setIsEditing(false);
      await loadPassport();
      alert('Passport updated successfully!');
    } catch (error: any) {
      console.error('Error saving passport:', error);
      alert(`Failed to save passport: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    setEditedAttributes({
      ...editedAttributes,
      skills: [...editedAttributes.skills, ''],
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...editedAttributes.skills];
    newSkills[index] = value;
    setEditedAttributes({ ...editedAttributes, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = editedAttributes.skills.filter((_, i) => i !== index);
    setEditedAttributes({ ...editedAttributes, skills: newSkills });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-12 rounded-3xl text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading passport...</p>
        </div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-12 rounded-3xl text-center">
          <p className="text-gray-600 mb-4">Passport not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="glass-card border-0"
          >
            <ArrowLeft className="w-4 h-4" />
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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">My zk-Passport</h1>
            <p className="text-gray-600">Privacy-preserving cryptoidentity</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="btn-primary border-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Attributes
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="glass-card p-8 rounded-3xl border-0 mb-6">
            <h2 className="text-2xl font-bold mb-6">Edit Attributes</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedAttributes.location}
                  onChange={(e) =>
                    setEditedAttributes({ ...editedAttributes, location: e.target.value })
                  }
                  placeholder="e.g., Singapore, San Francisco"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="ageRange">Age Range</Label>
                <Input
                  id="ageRange"
                  value={editedAttributes.ageRange}
                  onChange={(e) =>
                    setEditedAttributes({ ...editedAttributes, ageRange: e.target.value })
                  }
                  placeholder="e.g., 25-30, 30-35"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="space-y-2 mt-2">
                  {editedAttributes.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="e.g., React, Solidity, Design"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    className="w-full"
                  >
                    + Add Skill
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary border-0 flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    loadPassport();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <PassportCard
            memberName={passport.memberName}
            identityCommitment={passport.identityCommitment}
            attributes={passport.attributes}
            groups={passport.groups}
            createdAt={passport.createdAt}
            verified={true}
          />
        )}
      </div>
    </div>
  );
}

