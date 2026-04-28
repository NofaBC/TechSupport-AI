# Magazinify AI - Onboarding Troubleshooting

**Product:** Magazinify AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 28, 2026

---

## Onboarding Flow Overview

New users complete onboarding at `/onboarding` after registering:

1. **Business Name** (required) - Company/brand name
2. **Business Website URL** (required) - Source for AI content generation
3. **Contact Email** (required) - Pre-filled from auth
4. **Business Tagline** (optional) - Helps AI understand brand
5. **Brand Tone** (required) - Professional, Casual, Friendly, or Authoritative
6. **Brand Color** (required) - Primary color for magazine styling
7. **Logo** (optional) - Appears on magazine pages

Upon completion, user is redirected to `/dashboard`.

---

## Common Onboarding Issues

### "Launch My Magazine" button not working
**Symptom:** User clicks button but nothing happens or gets error.

**Root Cause:**
- Required fields not filled
- JavaScript error
- Firebase write permission issue

**Solution:**
1. Verify all required fields are filled (Business Name, URL, Email)
2. Check URL format includes https://
3. Refresh page and try again
4. Check browser console for errors (F12)

**Escalate to Level 2 if:**
- All fields valid but still fails
- Firebase error in console

---

### Business URL validation fails
**Symptom:** "Invalid URL" or URL field shows error.

**Root Cause:**
- Missing protocol (https://)
- Typo in URL
- URL unreachable

**Solution:**
1. Format URL correctly:
   - ✅ `https://www.example.com`
   - ✅ `https://example.com`
   - ❌ `www.example.com` (missing protocol)
   - ❌ `example.com` (missing protocol)
2. Verify website is live and accessible
3. Use main domain, not subpages (e.g., not `/about` page)
4. Test URL in new browser tab to confirm it loads

**If Website is Down:**
- User must fix website first
- AI needs live site to scrape content

---

### Logo upload fails
**Symptom:** Logo doesn't upload or shows error.

**Root Cause:**
- File too large (>5MB)
- Wrong file format
- Network timeout

**Solution:**
1. Use supported formats: PNG, JPG, JPEG, WebP
2. Resize image to under 5MB
3. Use square or landscape aspect ratio (portrait may crop poorly)
4. Try different image if current one fails

**Recommended Logo Specs:**
- Size: 200x200 to 500x500 pixels
- Format: PNG with transparency
- Max file size: 2MB (recommended)

**If Upload Keeps Failing:**
- Skip logo for now (optional field)
- Add logo later in Settings
- Escalate if critical

---

### Redirect to login after submitting
**Symptom:** User fills form, submits, but gets redirected to login.

**Root Cause:**
- Session expired during onboarding
- Firebase auth token invalid
- User signed out in another tab

**Solution:**
1. Log in again
2. Return to `/onboarding` (form may need re-entry)
3. Complete onboarding in single session
4. Don't sign out in other tabs during process

---

### "Permission denied" or Firestore error
**Symptom:** Error message mentioning permissions or database.

**Root Cause:**
- Firebase security rules blocking write
- User UID mismatch
- Database quota exceeded (rare)

**Solution:**
1. Sign out completely
2. Sign back in
3. Try onboarding again

**Escalate to Level 2 if:**
- Error persists after fresh login
- Multiple users reporting same issue

---

### Onboarding page not loading
**Symptom:** Blank page or infinite loading at `/onboarding`.

**Root Cause:**
- User not authenticated
- JavaScript failed to load
- Browser compatibility issue

**Solution:**
1. Verify user is logged in (check for session)
2. Try accessing `/login` first, then `/onboarding`
3. Clear browser cache
4. Try Chrome or Edge browser

---

## Brand Preferences Explained

### Business Tagline
- Short phrase describing business (e.g., "Fresh eggs from our family farm")
- Helps AI understand brand positioning
- Optional but improves content quality

### Brand Tone
| Tone | Best For | AI Writing Style |
|------|----------|------------------|
| Professional | B2B, Corporate | Formal, authoritative |
| Casual | Lifestyle, Local | Relaxed, conversational |
| Friendly | Consumer, Retail | Warm, approachable |
| Authoritative | Expert, Technical | Confident, informative |

### Brand Color
- Primary color used in magazine design
- Affects headers, accents, backgrounds
- Use brand's dominant color
- Avoid very light colors (poor contrast)

---

## Post-Onboarding Issues

### User completed onboarding but can't see dashboard
**Symptom:** Redirected to `/onboarding` again or blank dashboard.

**Root Cause:**
- Tenant document not created
- `onboardingComplete` flag not set
- Race condition during creation

**Solution:**
1. Check if tenant exists in Firestore (Level 2)
2. If missing, user may need to re-onboard
3. If exists but flag wrong, update `onboardingComplete: true`

---

### Need to change onboarding details
**Symptom:** User made mistake during onboarding.

**Solution:**
1. Go to `/settings` to update:
   - Business Name
   - Business URL
   - Tagline
   - Brand Tone
   - Brand Color
2. Logo can be updated in Settings (future feature)

**Note:** Changes apply to future magazine issues, not existing ones.

---

## Registration Issues

### Google Sign-In not working
**Symptom:** "Sign in with Google" fails.

**Root Cause:**
- Google OAuth misconfigured
- Pop-up blocked
- Third-party cookies disabled

**Solution:**
1. Allow pop-ups for magazinify.ai
2. Enable third-party cookies
3. Try email/password registration instead

---

### Email registration - "Email already in use"
**Symptom:** Cannot register with email.

**Root Cause:**
- Account already exists
- Previously used Google Sign-In with same email

**Solution:**
1. Try logging in instead of registering
2. Use "Forgot Password" if needed
3. Try Google Sign-In if email linked to Google

---

## When to Escalate

**Escalate to Level 2 if:**
- Firestore/Firebase errors in console
- Tenant not created after successful form submission
- Multiple users failing onboarding
- URL validation failing for obviously valid URLs

**Escalate to Level 3 if:**
- Firebase Authentication issues
- Storage upload system failure
- Database permission rules broken

---

**Related Articles:**
- `/kb/factory-wide/auth.md` - Account/login issues
- `/kb/magazinify/magazine-generation.md` - After onboarding
- `/kb/magazinify/billing.md` - Plan selection
