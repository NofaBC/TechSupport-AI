# Magazinify AI - Billing & Subscription Troubleshooting

**Product:** Magazinify AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 28, 2026

---

## Pricing Plans Overview

### Basic Plan
- **Price:** Contact for pricing
- **Pages per Issue:** 12 pages
- **Frequency:** Monthly publication
- **Features:**
  - AI-generated magazine content
  - Brand customization (colors, tone, logo)
  - Shareable public links
  - Dashboard analytics

### Pro Plan
- **Price:** Contact for pricing
- **Pages per Issue:** 24 pages
- **Frequency:** Monthly publication
- **Features:**
  - Everything in Basic
  - Double the page count
  - Priority generation queue
  - Advanced customization options

---

## Common Billing Issues

### Wrong plan displayed
**Symptom:** User paid for Pro but dashboard shows Basic.

**Root Cause:**
- Stripe webhook not processed
- Delayed sync between Stripe and Firestore
- Payment still processing

**Solution:**
1. Check email for payment confirmation
2. Wait 5-10 minutes for webhook processing
3. Refresh the billing page
4. Sign out and sign back in

**Verification Steps:**
1. Ask user for payment confirmation email
2. Verify Stripe customer ID exists in user profile
3. Check subscription status in Firestore

**Escalate to Level 2 if:**
- Payment confirmed but plan not updated after 1 hour
- Stripe webhook logs show errors

---

### Payment failed / Card declined
**Symptom:** Cannot complete checkout, card rejected.

**Root Cause:**
- Insufficient funds
- Card expired
- Bank blocked transaction
- International card restrictions

**Solution:**
1. Try different payment method
2. Contact bank to authorize transaction
3. Ensure card supports online/international purchases
4. Check card expiration date

**Note:** Magazinify AI uses Stripe - widely accepted payment processor.

---

### Subscription not activating
**Symptom:** User completed checkout but subscription status shows inactive.

**Root Cause:**
- Checkout completed but webhook failed
- User closed browser before redirect

**Solution:**
1. Check Stripe for successful payment
2. Manually verify customer subscription status
3. Trigger subscription sync if needed

**Escalate to Level 2 if:**
- Stripe shows active subscription but app doesn't reflect it

---

### Cannot cancel subscription
**Symptom:** User wants to cancel but no option in UI.

**Current Flow:**
- Contact hello@magazinify.ai for cancellation
- Admin processes cancellation manually

**Solution:**
1. Direct user to contact support email
2. Provide: business name, email, reason for cancellation
3. Cancellation processed within 24-48 hours

**Future Enhancement:** Self-service cancellation via Stripe portal (planned).

---

### Charged incorrectly
**Symptom:** User charged wrong amount or duplicate charge.

**Solution:**
1. Verify plan selected during checkout
2. Check for duplicate transactions in Stripe
3. If duplicate, initiate refund via admin

**Escalate to Level 2 immediately for:**
- Any duplicate charges
- Charges after cancellation
- Wrong amount charged

---

## Subscription Status Reference

| Status | Meaning | User Action |
|--------|---------|-------------|
| active | Subscription running, billing current | None |
| past_due | Payment failed, retry pending | Update payment method |
| canceled | User canceled, access until period end | Resubscribe if needed |
| unpaid | Multiple payment failures | Contact support |
| trialing | Trial period (if applicable) | Will auto-convert |

---

## Plan Feature Disputes

### "I should get more pages"
**Symptom:** User believes they're not getting correct page count.

**Verification:**
1. Check plan in Firestore: Basic = 12, Pro = 24
2. Count actual pages in generated issue
3. Compare to plan entitlement

**If Discrepancy:**
- Log issue details
- Escalate to Level 2 for regeneration

---

### "I paid for Pro but content quality is same"
**Explanation:**
- Pro plan affects **page count**, not content quality
- AI content generation is same for both plans
- Pro gets 2x the pages, same quality per page

**Response Template:**
> "The Pro plan provides 24 pages per issue compared to Basic's 12 pages. Both plans use the same AI content generation quality. Would you like to verify your issue has 24 pages?"

---

## Refund Policy

**Standard Policy:**
- Refunds considered case-by-case
- Contact hello@magazinify.ai with request
- Include: reason, business name, payment date

**Common Refund Scenarios:**
1. Technical failure prevented magazine generation
2. Accidental duplicate purchase
3. Immediate cancellation (within 24 hours)

**Non-Refundable:**
- Used/generated magazines
- Partial month requests
- Dissatisfaction with AI content quality (subjective)

---

## Payment Methods

Magazinify AI accepts via Stripe:
- Visa
- Mastercard
- American Express
- Discover
- International cards (most countries)
- Some regional cards

**Not Currently Supported:**
- PayPal
- Bank transfers
- Cryptocurrency
- Invoice/PO payments

---

## When to Escalate

**Escalate to Level 2 if:**
- Payment confirmed but plan not synced (>1 hour)
- Duplicate charges or billing errors
- Customer dispute/chargeback
- Refund request

**Escalate to Level 3 if:**
- Stripe webhook system failure
- Multiple users reporting same billing issue
- Payment processing down

---

**Related Articles:**
- `/kb/magazinify/magazine-generation.md` - What you get with each plan
- `/kb/factory-wide/auth.md` - Account access issues
