# Magazinify AI - Magazine Generation Troubleshooting

**Product:** Magazinify AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 28, 2026

---

## How Magazine Generation Works

Magazinify AI generates digital magazines by:
1. Scraping content from the user's business website
2. Using AI to create relevant articles and layouts
3. Generating page images with brand colors and tone
4. Compiling into an interactive flipbook

**Normal generation time:** 2-4 minutes  
**Maximum timeout:** 5 minutes (Vercel Pro function limit)

---

## Common Generation Errors

### "Generation failed" / Timeout Error
**Symptom:** User clicks "Generate Magazine Issue" and gets an error after waiting.

**Root Cause:** 
- Website too complex to scrape in time limit
- OpenAI API rate limit or timeout
- Server under high load

**Solution:**
1. Retry generation (may succeed on second attempt)
2. Try during off-peak hours (early morning, late evening)
3. Simplify business URL (use main domain, not deep links)

**Prevention:**
- Ensure website loads quickly
- Avoid generating during peak hours (9 AM - 5 PM EST)

---

### "Issue for [month] already exists"
**Symptom:** Error when trying to create a new magazine issue.

**Root Cause:** Monthly guard prevents duplicate issues for same billing period.

**Solution:**
1. Navigate to `/magazines` to view existing issue
2. Edit existing issue if changes needed
3. Wait for next month to generate new issue

**When User Legitimately Needs Regeneration:**
- Escalate to Level 2 with justification
- Admin can delete existing issue to allow regeneration

---

### "Tenant not found"
**Symptom:** Generation fails immediately with this error.

**Root Cause:** 
- User not properly onboarded
- Firestore tenant document missing

**Solution:**
1. Have user complete onboarding at `/onboarding`
2. Verify Firebase Authentication is active
3. Check Firestore for tenant document existence

**Escalate to Level 2 if:**
- User completed onboarding but error persists

---

### "Content doesn't match my business"
**Symptom:** Generated magazine has irrelevant or generic content.

**Root Cause:**
- Website has limited scrape-able content
- Website behind authentication/paywall
- AI misinterpreted industry/niche

**Solution:**
1. Verify business URL in Settings is correct
2. Check website is publicly accessible (not behind login)
3. Ensure website has substantial text content
4. Update brand preferences (tagline, tone) for better context

**Escalate to Level 2 if:**
- Content is completely unrelated to business
- Same issue persists after URL/settings verification

---

## Generation Quality Issues

### Low-quality or blurry images
**Symptom:** Magazine pages appear pixelated or unclear.

**Root Cause:** Image generation service limitations

**Solution:**
1. View on larger screen (images optimized for desktop)
2. Wait for page to fully load before judging
3. Report specific pages that are problematic

**Escalate to Level 2 if:**
- Multiple pages consistently blurry
- Text unreadable on any page

---

### Missing pages
**Symptom:** Magazine has fewer pages than plan allows.

**Root Cause:** 
- Limited source content from website
- Generation partial failure

**Verification:**
1. Check plan: Basic = 12 pages, Pro = 24 pages
2. Verify actual page count in issue details

**Escalate to Level 2 if:**
- Page count significantly below plan limit
- User paid for Pro but received Basic page count

---

## Post-Generation Issues

### Shareable link not working
**Symptom:** Link shows "Magazine Not Found"

**Root Cause:**
- Issue not published yet
- Issue status stuck in "draft"

**Solution:**
1. Go to `/magazines/[yearMonth]`
2. Click "Publish" if available
3. Wait a few seconds and retry link

**Escalate to Level 2 if:**
- Published issue still not accessible via link

---

### Email notification not received
**Symptom:** User didn't get "Your magazine is ready" email.

**Root Cause:**
- Email delivery failed (non-blocking operation)
- Email in spam folder

**Solution:**
1. Check spam/promotions folder
2. Verify email address in Settings
3. Magazine is still accessible at `/magazines`

**Note:** Email is informational only; magazine access doesn't require it.

---

## When to Escalate

**Escalate to Level 2 if:**
- Same error occurs 3+ times
- Content quality consistently poor
- Technical errors in console logs
- User paid but cannot generate

**Escalate to Level 3 if:**
- Multiple users report same generation issue
- OpenAI/Stripe API appears down
- Systematic content quality degradation

---

**Related Articles:**
- `/kb/magazinify/flipbook-viewer.md` - Viewing generated magazines
- `/kb/magazinify/billing.md` - Plan features and limits
- `/kb/magazinify/onboarding.md` - Initial setup issues
