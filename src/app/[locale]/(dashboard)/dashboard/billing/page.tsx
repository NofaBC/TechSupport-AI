'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription and view usage</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">Internal Use</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">Internal Deployment</p>
              <p className="text-sm text-gray-500">No billing configured for internal use</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">—</div>
              <p className="text-sm text-gray-500">Cases Resolved</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">—</div>
              <p className="text-sm text-gray-500">L2 Minutes</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">—</div>
              <p className="text-sm text-gray-500">SMS Sent</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">—</div>
              <p className="text-sm text-gray-500">Voice Minutes</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Billing features will be enabled in Phase 8 (late 2026)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
