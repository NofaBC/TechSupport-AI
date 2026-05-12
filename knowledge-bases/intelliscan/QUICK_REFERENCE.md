# IntelliScan AI™ - Quick Reference Troubleshooting Guide

**Product:** IntelliScan AI™  
**Support Level:** Level 1  
**Last Updated:** May 12, 2026

---

> **Purpose:** Fast lookup for common issues. For detailed context, see linked full articles.

---

## Website Scanning Issues

### Issue: Scan fails with "Unable to access website"
**Cause:** Website blocks automated requests or is offline

**Fix:**
1. Verify the website URL is correct and accessible
2. Check if website has a robots.txt blocking scrapers
3. Try scanning again after a few minutes

**Escalate:**
- If website is accessible in browser but scan still fails

📄 *Full guide: `/kb/intelliscan/scanning-issues.md`*

---

### Issue: Scan takes too long or times out
**Cause:** Large website or slow server response

**Fix:**
1. Wait for scan to complete (can take up to 2 minutes for large sites)
2. If timeout, try scanning during off-peak hours
3. Check your internet connection

**Escalate:**
- If scan consistently times out for the same website

📄 *Full guide: `/kb/intelliscan/scanning-issues.md`*

---

### Issue: Report shows incomplete data
**Cause:** Website uses heavy JavaScript rendering

**Fix:**
1. Some dynamic content may not be captured
2. Re-scan the website
3. Check if critical pages are accessible without login

**Escalate:**
- If key business pages are consistently missing from reports

📄 *Full guide: `/kb/intelliscan/scanning-issues.md`*

---

## Report Issues

### Issue: Cannot download PDF
**Cause:** Browser blocking pop-ups or PDF generation error

**Fix:**
1. Allow pop-ups for intelli-scan-ai.vercel.app
2. Try a different browser (Chrome recommended)
3. Clear browser cache and retry

**Escalate:**
- If PDF generation fails across multiple browsers

📄 *Full guide: `/kb/intelliscan/reports.md`*

---

### Issue: Report recommendations seem generic
**Cause:** Limited content found on website

**Fix:**
1. Ensure website has sufficient text content
2. Add more pages to your website profile
3. Re-scan after adding content

**Escalate:**
- If recommendations don't improve after content updates

📄 *Full guide: `/kb/intelliscan/reports.md`*

---

### Issue: Cannot find old reports
**Cause:** Free tier doesn't save report history

**Fix:**
1. Upgrade to Starter ($19/mo) or higher for report history
2. Download PDF copies before they expire

**Escalate:**
- If paid user cannot access saved reports

📄 *Full guide: `/kb/intelliscan/reports.md`*

---

## Subscription & Billing

### Issue: Website limit reached
**Cause:** Plan limit exceeded

**Fix:**
1. Check current plan limits:
   - Free: 1 website
   - Starter: 1 website
   - Pro: 3 websites
   - Agency: 30 websites
2. Upgrade plan or remove unused websites

**Escalate:**
- If website count shows incorrectly

📄 *Full guide: `/kb/intelliscan/subscriptions.md`*

---

### Issue: Scheduled scans not running
**Cause:** Free tier or scan frequency limit

**Fix:**
1. Free tier only supports manual scans
2. Check plan scan frequency:
   - Starter: Monthly
   - Pro: Bi-weekly
   - Agency: Weekly
3. Verify website is still active in dashboard

**Escalate:**
- If paid plan scans are not running on schedule

📄 *Full guide: `/kb/intelliscan/subscriptions.md`*

---

## Account Issues

### Issue: Cannot log in
**Fix:**
1. Click "Forgot password"
2. Reset via email
3. Try logging in again

**Escalate:**
- If reset email not received within 5 minutes

📄 *Full guide: `/kb/factory-wide/auth.md`*

---

## Pricing Plans Reference

| Plan | Price | Websites | Scan Frequency | Key Features |
|------|-------|----------|----------------|--------------|
| Free | $0/mo | 1 | Manual only | Basic report |
| Starter | $19/mo | 1 | Monthly | History, PDF |
| Pro | $49/mo | 3 | Bi-weekly | Change detection |
| Agency | $249/mo | 30 | Weekly | Multi-client |

---

## Escalation Summary

| Issue Category | Escalate When |
|----------------|---------------|
| Website Scanning | Scan fails for accessible website |
| Reports | PDF generation fails across browsers |
| Subscriptions | Paid features not working |
| Authentication | Reset email not received |

---

**Related Full Articles:**
- `/kb/intelliscan/scanning-issues.md`
- `/kb/intelliscan/reports.md`
- `/kb/intelliscan/subscriptions.md`
- `/kb/factory-wide/auth.md`
