'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TeamPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600">Manage your support team</p>
        </div>
        <Button>Invite Member</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current user - placeholder */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  F
                </div>
                <div>
                  <p className="font-medium">Farhad Nasserghodsi</p>
                  <p className="text-sm text-gray-500">fnasserg@gmail.com</p>
                </div>
              </div>
              <Badge>Owner</Badge>
            </div>

            <p className="text-sm text-gray-500 text-center py-4">
              Invite team members to collaborate on support cases
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
