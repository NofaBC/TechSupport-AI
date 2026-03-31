'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Configure your TechSupport AI™ workspace</p>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          Coming Soon
        </Badge>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Settings configuration is currently managed via environment variables. 
          A full settings UI will be available in a future update.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              General Settings
              <Badge variant="outline" className="text-xs">Planned</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Company name, timezone, and default language settings.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Notifications
              <Badge variant="outline" className="text-xs">Planned</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Email and Slack notification preferences.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Integrations
              <Badge variant="outline" className="text-xs">Planned</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Twilio, OpenAI, and other API configurations.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Escalation Rules
              <Badge variant="outline" className="text-xs">Planned</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              L1 → L2 → L3 escalation thresholds and rules.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
