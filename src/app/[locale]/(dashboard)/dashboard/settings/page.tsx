'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure your TechSupport AI™ workspace</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Company name, timezone, and default language settings will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Email and Slack notification preferences will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Twilio, OpenAI, and other API configurations will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escalation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              L1 → L2 → L3 escalation thresholds and rules will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
