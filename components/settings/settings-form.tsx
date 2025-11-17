"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { updateProfile } from "@/app/actions/profile-actions";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface SettingsFormProps {
  profile: Profile | null;
  user: User;
}

export function SettingsForm({ profile, user }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName,
        company,
        bio,
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Profile Information</CardTitle>
        <CardDescription className="text-gray-400">
          Update your personal information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-gray-700/50 border-white/10 text-gray-400"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-gray-700/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-gray-300">Company</Label>
            <Input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
              className="bg-gray-700/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your projects"
              rows={4}
              className="bg-gray-700/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
