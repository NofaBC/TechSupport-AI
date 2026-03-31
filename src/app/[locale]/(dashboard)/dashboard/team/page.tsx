'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TeamPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/firebase/client').then((module) => {
      const auth = module.auth;
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const getUserInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const getUserName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600">Manage your support team</p>
        </div>
        <Button disabled title="Coming soon">
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={getUserName()}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {getUserInitial()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{getUserName()}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge>Owner</Badge>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Please sign in to view team members</p>
            )}

            <p className="text-sm text-gray-500 text-center py-4">
              Team invitations coming soon
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Owner</p>
                <p className="text-sm text-gray-500">Full access to all features and billing</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Agent</p>
                <p className="text-sm text-gray-500">Handle cases, access knowledge base</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Viewer</p>
                <p className="text-sm text-gray-500">View-only access to dashboard and cases</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
