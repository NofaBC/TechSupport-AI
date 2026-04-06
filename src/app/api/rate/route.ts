import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/rate?case=CASE_ID&rating=1-5
 *
 * Simple endpoint for customers to rate their support experience.
 * Returns an HTML page with a thank you message.
 * This is called when customers click a rating link in the resolution email.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const caseId = searchParams.get('case');
  const ratingStr = searchParams.get('rating');

  // Validate inputs
  if (!caseId || !ratingStr) {
    return new NextResponse(getRatingPage('error', 'Invalid rating link.'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return new NextResponse(getRatingPage('error', 'Invalid rating value.'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const db = adminDb();

    // Verify the case exists
    const caseDoc = await db.collection('cases').doc(caseId).get();
    if (!caseDoc.exists) {
      return new NextResponse(getRatingPage('error', 'Case not found.'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const caseData = caseDoc.data();

    // Check if already rated (prevent duplicate ratings)
    const existingRating = await db
      .collection('ratings')
      .where('caseId', '==', caseId)
      .limit(1)
      .get();

    if (!existingRating.empty) {
      return new NextResponse(
        getRatingPage('already_rated', 'You have already rated this support experience.'),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Save the rating
    await db.collection('ratings').add({
      caseId,
      ticketNumber: caseData?.ticketNumber || '',
      rating,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update case with rating
    await caseDoc.ref.update({
      customerRating: rating,
      ratedAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Case ${caseId} rated: ${rating}/5`);

    return new NextResponse(getRatingPage('success', '', rating), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Rating error:', error);
    return new NextResponse(
      getRatingPage('error', 'Something went wrong. Please try again later.'),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Generate a simple HTML page for the rating response.
 */
function getRatingPage(
  status: 'success' | 'error' | 'already_rated',
  message: string,
  rating?: number
): string {
  const starEmoji = rating ? '⭐'.repeat(rating) : '';
  const feedbackText =
    rating && rating <= 2
      ? "We're sorry to hear that. We'll work to improve."
      : rating && rating >= 4
        ? "We're glad we could help!"
        : '';

  const title =
    status === 'success'
      ? 'Thank You!'
      : status === 'already_rated'
        ? 'Already Rated'
        : 'Oops!';

  const bgColor =
    status === 'success' ? '#10B981' : status === 'already_rated' ? '#F59E0B' : '#EF4444';

  const bodyContent =
    status === 'success'
      ? `
        <div style="font-size: 48px; margin-bottom: 16px;">${starEmoji}</div>
        <h1 style="margin: 0 0 8px 0; font-size: 28px;">Thank You for Your Feedback!</h1>
        <p style="margin: 0; color: #6B7280; font-size: 16px;">${feedbackText}</p>
      `
      : `
        <h1 style="margin: 0 0 8px 0; font-size: 28px;">${title}</h1>
        <p style="margin: 0; color: #6B7280; font-size: 16px;">${message}</p>
      `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - TechSupport AI</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 20px;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      ${
        status === 'success'
          ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
      }
    </div>
    ${bodyContent}
    <p style="margin-top: 32px; font-size: 12px; color: #9CA3AF;">
      NOFA AI Support Team
    </p>
  </div>
</body>
</html>
  `;
}
