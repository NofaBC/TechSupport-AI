import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check tenant ID / user info
// GET /api/debug/whoami?tenant=YOUR_TENANT_ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenant') || request.headers.get('x-tenant-id');
  
  return NextResponse.json({
    message: 'Use this to verify your tenant ID matches',
    providedTenantId: tenantId,
    instructions: [
      '1. Open browser console on TechSupport AI dashboard',
      '2. Run: firebase.auth().currentUser?.uid',
      '3. Compare that UID with TECHSUPPORT_TENANT_ID in CommandDesk Vercel',
      '4. They must match exactly',
    ],
    checkCasesUrl: tenantId 
      ? `https://tech-support-ai-one.vercel.app/api/cases` 
      : 'Add ?tenant=YOUR_TENANT_ID to check',
  });
}
