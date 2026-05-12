# IntelliScan AI™ - Reports & PDF Export Guide

**Product:** IntelliScan AI™  
**Support Level:** Level 1, Level 2  
**Last Updated:** May 12, 2026

---

## Overview

IntelliScan AI™ generates AI-powered opportunity reports that identify automation gaps and recommend solutions for business websites. Reports can be exported as branded PDFs for client presentations.

---

## Report Contents

Each IntelliScan report includes:

1. **Website Overview** — Basic info about the scanned site
2. **Content Analysis** — Summary of what was found on the website
3. **Automation Opportunities** — AI-identified gaps that could benefit from automation
4. **Recommendations** — Specific AI solutions to implement
5. **Priority Ranking** — Which opportunities to tackle first
6. **"Build This for Me" CTA** — Link to NOFA AI Factory™ for implementation

---

## Common Report Issues

### "Cannot download PDF"

**Symptom:** PDF button doesn't work or download fails.

**Possible Causes:**
1. Browser blocking pop-ups
2. Ad blocker interfering
3. Browser incompatibility
4. Large report causing memory issues

**Fix:**
1. **Allow pop-ups:**
   - Chrome: Click the blocked pop-up icon in address bar → Allow
   - Firefox: Options → Privacy → Exceptions → Add intelli-scan-ai.vercel.app
   - Safari: Preferences → Websites → Pop-up Windows → Allow

2. **Disable ad blocker temporarily:**
   - uBlock Origin, AdBlock Plus, etc. may interfere with PDF generation

3. **Try different browser:**
   - Chrome works best for PDF generation
   - Edge and Firefox also supported
   - Safari may have issues with some PDF features

4. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear cached images and files
   - Refresh and try again

**Escalate to L2 if:**
- PDF fails across all browsers
- Specific error message appears during generation

---

### "Report shows generic recommendations"

**Symptom:** AI recommendations don't seem tailored to the website.

**Possible Causes:**
1. Website has minimal content
2. Scan captured limited data (JavaScript site)
3. Website content is too vague or generic

**How AI Generates Recommendations:**
- Analyzes text content for business type
- Identifies customer interaction points
- Looks for manual processes that could be automated
- Compares against common automation opportunities

**Fix:**
1. **Ensure sufficient content:**
   - Website should have clear service/product descriptions
   - Contact pages, about pages help identify business type
   - FAQ sections provide valuable context

2. **Re-scan after content updates:**
   - If website was recently updated, re-scan
   - Add more descriptive text to key pages

3. **Check scan completeness:**
   - If using JavaScript framework, consider SSR
   - Verify key pages are publicly accessible

**Escalate to L2 if:**
- Website has rich content but recommendations are still generic
- AI misidentifies the business type entirely

---

### "Cannot find old reports"

**Symptom:** Previously generated reports not visible in dashboard.

**Cause:** Report history depends on subscription plan.

**Plan-Specific History:**
| Plan | Report History |
|------|----------------|
| Free | No history (current only) |
| Starter | Full history |
| Pro | Full history |
| Agency | Full history |

**Solutions:**
1. **Free users:** 
   - Download PDF immediately after scan
   - Upgrade to Starter ($19/mo) for history

2. **Paid users:**
   - Reports should appear in Reports section
   - Filter by website or date range
   - Check if correct website is selected

**Escalate to L2 if:**
- Paid user cannot see reports that should be saved
- Report history shows incorrect dates

---

### "Report data seems outdated"

**Symptom:** Report shows old information even after website changes.

**Cause:** IntelliScan caches scan results until next scheduled or manual scan.

**Fix:**
1. Run a new manual scan to get fresh data
2. Check when last scan occurred (shown in dashboard)
3. Wait for next scheduled scan (based on plan frequency)

**Scan Frequency by Plan:**
| Plan | Frequency |
|------|-----------|
| Free | Manual only |
| Starter | Monthly |
| Pro | Bi-weekly |
| Agency | Weekly |

---

### "Report takes long to generate"

**Symptom:** Waiting screen shows for extended period after scan.

**Cause:** AI analysis can take 30-60 seconds for complex websites.

**Normal Timeline:**
1. Website scraping: 5-30 seconds
2. AI analysis: 15-45 seconds
3. Report generation: 5-10 seconds
4. **Total:** 30-90 seconds typical

**If Taking Longer:**
1. Large websites take more time
2. AI service may be under high load
3. Network latency can add delay

**Fix:**
- Wait up to 2 minutes before refreshing
- Check internet connection
- Try again during off-peak hours (early morning)

**Escalate to L2 if:**
- Reports consistently take more than 3 minutes
- Process hangs indefinitely

---

## Understanding Report Quality

### What Makes a Good Scan:
- Website has 5+ pages of content
- Clear product/service descriptions
- Contact forms or customer interaction points
- FAQ or support sections
- About page with business context

### Factors Limiting Report Quality:
- Single-page websites (limited context)
- Image-heavy sites with little text
- Sites in non-English languages (reduced accuracy)
- Highly technical/niche businesses
- Password-protected content

---

## PDF Export Features

### What's Included in PDF:
- Full report content
- NOFA branding
- Date and website URL
- All recommendations with priority
- "Build This for Me" call-to-action

### PDF Best Practices:
1. Generate PDF immediately after scan
2. Save copies for client records
3. Use for sales presentations
4. Include in proposals

---

## When to Escalate

**Escalate to Level 2 if:**
- PDF generation fails consistently
- Report content is clearly wrong (not just generic)
- Paid user missing report history
- AI recommendations harmful or inappropriate

**Escalate to Level 3 if:**
- Multiple users report same report generation issue
- AI producing factually incorrect recommendations
- PDF contains errors or formatting issues

---

**Related Articles:**
- `/kb/intelliscan/scanning-issues.md` - Scanning problems
- `/kb/intelliscan/subscriptions.md` - Plan features
- `/kb/intelliscan/QUICK_REFERENCE.md` - Quick troubleshooting
