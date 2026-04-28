# Magazinify AI - Quick Reference Troubleshooting Guide

**Product:** Magazinify AI  
**Support Level:** Level 1  
**Last Updated:** April 28, 2026

---

> **Purpose:** Fast lookup for common issues. For detailed context, see linked full articles.

---

## Magazine Generation Issues

### Issue: Generation takes too long (>5 minutes)
**Cause:** Complex website or high server load

**Fix:**
1. Wait up to 5 minutes (normal generation time is 2-4 minutes)
2. If still processing, refresh the page and check /magazines

**If Not Resolved:**
- Try generating again during off-peak hours

**Escalate:**
- If generation consistently fails after 10+ minutes

📄 *Full guide: `/kb/magazinify/magazine-generation.md`*

---

### Issue: "Issue already exists" error
**Cause:** Monthly issue already generated for current period

**Fix:**
1. Go to /magazines
2. Find existing issue for this month
3. Edit or view existing issue

**Escalate:**
- If user needs to regenerate for valid reason

📄 *Full guide: `/kb/magazinify/magazine-generation.md`*

---

### Issue: Content doesn't match my website
**Cause:** Website scraping limitations or outdated cache

**Fix:**
1. Verify business URL in Settings
2. Ensure website has accessible content (not behind login)
3. Wait 24 hours and regenerate

**Escalate:**
- If content is completely unrelated to business

📄 *Full guide: `/kb/magazinify/magazine-generation.md`*

---

## Flipbook Viewer Issues

### Issue: Pages not loading in viewer
**Cause:** Browser compatibility or slow connection

**Fix:**
1. Refresh the page
2. Try Chrome or Edge browser
3. Clear browser cache
4. Check internet connection

**Escalate:**
- If pages never load after multiple attempts

📄 *Full guide: `/kb/magazinify/flipbook-viewer.md`*

---

### Issue: Flipbook not flipping properly
**Cause:** Mobile browser limitations

**Fix:**
1. Try landscape orientation on mobile
2. Use swipe gestures instead of tap
3. Access via desktop for full experience

**Escalate:**
- If critical viewing issue on desktop

📄 *Full guide: `/kb/magazinify/flipbook-viewer.md`*

---

## Account & Billing Issues

### Issue: Cannot log in
**Fix:**
1. Click "Forgot password" (if available)
2. Try "Sign in with Google" if originally used
3. Check email for account exists

**Escalate:**
- If password reset doesn't work

📄 *Full guide: `/kb/factory-wide/auth.md`*

---

### Issue: Wrong plan showing
**Cause:** Stripe webhook delay or failed payment

**Fix:**
1. Verify payment completed in email
2. Wait 5 minutes for sync
3. Refresh billing page

**Escalate:**
- If payment confirmed but plan not updated after 1 hour

📄 *Full guide: `/kb/magazinify/billing.md`*

---

## Onboarding Issues

### Issue: Logo upload fails
**Cause:** File too large or wrong format

**Fix:**
1. Use image under 5MB
2. Use PNG, JPG, or WebP format
3. Re-upload logo

**Escalate:**
- If valid image still fails

📄 *Full guide: `/kb/magazinify/onboarding.md`*

---

### Issue: Business URL validation fails
**Cause:** URL format incorrect or unreachable

**Fix:**
1. Include https:// prefix
2. Verify website is live and accessible
3. Use main domain (not subpages)

**Escalate:**
- If valid URL rejected

📄 *Full guide: `/kb/magazinify/onboarding.md`*

---

## Plan Comparison

| Feature | Basic | Pro |
|---------|-------|-----|
| Pages per Issue | 12 | 24 |
| Publications | Monthly | Monthly |
| Brand Customization | ✓ | ✓ |
| Shareable Links | ✓ | ✓ |
| Priority Generation | ✗ | ✓ |

---

## Escalation Summary

| Issue Category | Escalate When |
|----------------|---------------|
| Generation | Fails consistently >10 min |
| Flipbook | Desktop viewing broken |
| Billing | Payment confirmed, plan not updated |
| Account | Cannot access despite reset |
| Content | Completely wrong business content |

---

**Related Full Articles:**
- `/kb/magazinify/magazine-generation.md`
- `/kb/magazinify/flipbook-viewer.md`
- `/kb/magazinify/billing.md`
- `/kb/magazinify/onboarding.md`
- `/kb/factory-wide/auth.md`
