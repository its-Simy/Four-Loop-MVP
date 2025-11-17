"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { LogOut, Trash2 } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    // In a real app, you would implement account deletion
    console.log("Delete account requested");
  };

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Account Settings</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your account and security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-white/10 rounded-lg">
          <div>
            <p className="font-medium text-white">Sign Out</p>
            <p className="text-sm text-gray-400">Sign out from your account on this device</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
          <div>
            <p className="font-medium text-red-400">Delete Account</p>
            <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
