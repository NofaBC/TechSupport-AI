# NOFA AI Factory - Authentication & Account Management

**Products:** All NOFA AI Products (CareerPilot AI, TechSupport AI, CommandDesk AI, AffiliateLedger AI)  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 3, 2026

---

## Overview

All NOFA AI products use a unified authentication system. This guide covers common account issues across the entire product family.

---

## Password Reset

### Self-Service Password Reset

**Steps:**
1. Go to the product login page
2. Click **"Forgot password?"** or **"Reset password"**
3. Enter your registered email address
4. Check your email for reset link (check spam/junk folder)
5. Click the link within **1 hour** (links expire)
6. Enter new password (minimum 8 characters, mix of letters and numbers)
7. Log in with new password

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended but not required

---

### "Reset email not received"

**Troubleshooting:**
1. **Check spam/junk folder** - Most common issue
2. **Verify email address** - Ensure correct spelling
3. **Wait 5 minutes** - Emails can be delayed
4. **Check email filters** - Some corporate email filters block automated messages
5. **Try alternative email** - If using work email, try personal email if registered

**Add to safe senders:**
- `noreply@nofabusinessconsulting.com`
- `support@nofabusinessconsulting.com`

**If still not received after 15 minutes:**
- Escalate to Level 2 for account verification

---

### "Reset link expired"

**Solution:**
1. Request a new reset link
2. Use the link within 1 hour
3. Don't click links from old emails

**Common Causes:**
- Clicked link more than 1 hour after receiving
- Clicked link from an older reset request
- Browser cached an old URL

---

## Account Security

### "Forgot which email I used"

**Self-Service:**
1. Try common email addresses you use
2. Check browser saved passwords
3. Search email inbox for "NOFA" or product name

**If unable to find:**
- Contact support with:
  - Full name
  - Approximate signup date
  - Last 4 digits of payment card (if applicable)
  - Any other identifying information

---

### "Someone else accessed my account"

**Immediate Steps:**
1. Reset password immediately
2. Check account activity/login history (if available)
3. Update email password too (if compromised)
4. Enable two-factor authentication (if available)

**Report to Support:**
- When unauthorized access occurred
- What changes were made to account
- IP address or location (if visible in activity log)

**This is a Level 3 escalation** - Security concerns require human review.

---

## API Key Management

### Regenerating API Keys

**Location:**
1. Log in to your account
2. Navigate to **Settings** → **Integrations** (or **API**)
3. Find the API key section
4. Click **"Regenerate"** or **"Create new key"**
5. **Important:** Copy the new key immediately (shown only once)
6. Update your applications with the new key

**Warning:** Regenerating a key invalidates the old key immediately. Update all integrations before regenerating.

---

### "API key not working"

**Troubleshooting:**
1. **Verify key is correct** - Copy again, no extra spaces
2. **Check key hasn't expired** - Some keys have expiration dates
3. **Verify permissions** - Key may not have required scopes
4. **Check rate limits** - May be temporarily blocked for overuse
5. **Confirm subscription status** - API access may require active subscription

**Common Errors:**
| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid or expired key | Regenerate key |
| 403 Forbidden | Key lacks permissions | Check key scopes |
| 429 Too Many Requests | Rate limit exceeded | Wait and retry |

---

## Login Issues

### "Invalid email or password"

**Steps:**
1. Verify email is spelled correctly
2. Check Caps Lock is off
3. Try resetting password
4. Clear browser cache and cookies
5. Try incognito/private mode

---

### "Account locked"

**Cause:** Too many failed login attempts (usually 5+)

**Solutions:**
1. Wait 15-30 minutes for automatic unlock
2. Use "Forgot password" to reset
3. Contact support if still locked after 30 minutes

---

### "Session expired"

**Normal Behavior:**
- Sessions expire after inactivity (typically 24-48 hours)
- Log in again to continue

**If happening frequently:**
1. Check browser allows cookies for the site
2. Disable browser extensions that may interfere
3. Don't use "clear cookies on exit" setting

---

## Single Sign-On (SSO)

### Google Sign-In Issues

**"Google sign-in failed"**
1. Ensure pop-ups are allowed for the site
2. Try signing out of Google first, then sign in again
3. Clear browser cache
4. Use regular email/password login as fallback

### Account Linking

**"I have two accounts"**
- If you signed up with email AND later used Google with same email, accounts may not be linked
- Contact support to merge accounts

---

## Subscription & Billing Authentication

### "Can't access premium features after payment"

**Steps:**
1. Log out and log back in (refreshes permissions)
2. Check payment was successful (email confirmation)
3. Clear browser cache
4. Wait 5 minutes for subscription sync

**If still not working after 10 minutes:**
- Escalate to Level 2 with payment confirmation

---

## Multi-Factor Authentication (MFA)

### If MFA Available:

**Setup:**
1. Go to Settings → Security
2. Enable Two-Factor Authentication
3. Scan QR code with authenticator app (Google Authenticator, Authy)
4. Enter verification code to confirm

**Lost MFA Access:**
1. Use backup codes (provided during setup)
2. If no backup codes, contact support for account recovery
3. Identity verification required

---

## When to Escalate

**Escalate to Level 2 if:**
- Password reset emails not arriving after 15 minutes
- Account locked and not auto-unlocking after 30 minutes
- Login works but features don't load
- API key issues persist after regeneration

**Escalate to Level 3 if:**
- Suspected unauthorized account access (security issue)
- Account merge/linking requests
- Billing discrepancies affecting account access
- MFA recovery without backup codes

---

## Contact Information

**Support Email:** supportdesk@nofabusinessconsulting.com  
**Support Hours:** 24/7 (AI-assisted), Human response within 24 hours for escalations

---

**Related Articles:**
- Product-specific KB articles for feature-related authentication
- `LEVEL3_ESCALATION_GUIDE.md` - Security escalation procedures
