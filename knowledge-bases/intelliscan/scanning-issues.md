# IntelliScan AI™ - Website Scanning Troubleshooting

**Product:** IntelliScan AI™  
**Support Level:** Level 1, Level 2  
**Last Updated:** May 12, 2026

---

## Overview

IntelliScan AI™ uses server-side web scraping (Cheerio) to analyze website content and generate AI-powered opportunity reports. This guide covers common scanning issues.

---

## How Scanning Works

1. User enters website URL in dashboard
2. Server-side scraper fetches HTML content
3. Cheerio parses the HTML to extract text, links, and structure
4. OpenRouter (GPT-4o-mini) analyzes content for automation opportunities
5. Report is generated and stored in Firestore

**Important:** IntelliScan AI does NOT execute JavaScript. Websites that rely heavily on client-side rendering may have incomplete scans.

---

## Common Scanning Errors

### "Unable to access website"

**Symptom:** Scan fails immediately with access error.

**Possible Causes:**
1. Website URL is incorrect or has typo
2. Website is offline or experiencing downtime
3. Website blocks automated requests (bot protection)
4. SSL certificate issues

**Troubleshooting:**
1. **Verify URL format:**
   - Include `https://` or `http://`
   - Check for typos
   - Try with and without `www.`
   
2. **Test website accessibility:**
   - Open the URL in a browser
   - If it works in browser but not IntelliScan, website may have bot protection

3. **Check for bot protection:**
   - Cloudflare protection
   - CAPTCHA requirements
   - IP-based blocking

**Solutions:**
- Wait and retry (temporary blocks often lift)
- Contact website owner to whitelist our scanner
- For protected sites, manual analysis may be needed

**Escalate to L2 if:**
- Website is clearly accessible but scan keeps failing
- User needs to scan a site with bot protection

---

### "Scan timeout"

**Symptom:** Scan starts but never completes, eventually times out.

**Possible Causes:**
1. Very large website with many pages
2. Slow server response time
3. Network connectivity issues
4. Server-side processing bottleneck

**Troubleshooting:**
1. **Check website size:**
   - Extremely large sites (1000+ pages) may timeout
   - Single-page apps might also timeout due to JS loading

2. **Test server speed:**
   - If website loads slowly in browser, it will be slow to scan

3. **Try off-peak hours:**
   - Scanning during low-traffic times may help

**Solutions:**
- For large sites, focus on scanning specific important pages
- Wait and retry during off-peak hours
- Check if site has a faster mobile version

**Escalate to L2 if:**
- Moderate-sized sites (<100 pages) consistently timeout
- Timeout occurs immediately (not after waiting)

---

### "Incomplete scan / Missing content"

**Symptom:** Report is generated but missing key pages or sections.

**Possible Causes:**
1. Content loaded via JavaScript (React, Vue, Angular)
2. Content behind login/authentication
3. Content in iframes or embedded elements
4. Dynamic content loaded on scroll

**How to Identify:**
- Compare report content to actual website
- Check if missing content requires JavaScript to load
- Look for "loading" indicators in the website source

**Solutions:**
1. IntelliScan captures server-rendered HTML only
2. For JS-heavy sites, report will show what's in initial HTML
3. Consider adding static HTML alternatives

**What We Can Scan:**
- Static HTML content
- Server-rendered pages (PHP, WordPress, etc.)
- Meta tags and headers
- Link structure
- Text content in initial page load

**What We Cannot Scan:**
- Content loaded after page load (infinite scroll, lazy load)
- Content requiring user interaction
- Login-protected content
- Content inside JavaScript frameworks without SSR

**Escalate to L2 if:**
- User reports critical business content missing
- Website appears to have server-rendered content that's missing

---

### "Invalid URL format"

**Symptom:** Error appears before scan starts.

**Fix:**
1. Ensure URL starts with `http://` or `https://`
2. Remove trailing slashes if issues persist
3. Don't include query parameters unless necessary
4. Use the main domain, not deep links

**Examples:**
- ✅ `https://example.com`
- ✅ `https://www.example.com`
- ❌ `example.com` (missing protocol)
- ❌ `https://example.com/page?param=value` (query params may cause issues)

---

## Website Types and Expected Results

### WordPress Sites
- **Scan Quality:** Excellent
- **Notes:** Most content is server-rendered, scans well

### Shopify/E-commerce
- **Scan Quality:** Good
- **Notes:** Product listings usually scan well; checkout pages protected

### React/Vue/Angular SPAs
- **Scan Quality:** Limited
- **Notes:** Only initial HTML captured; dynamic content missed

### Wix/Squarespace
- **Scan Quality:** Good to Moderate
- **Notes:** Basic content scans well; some dynamic elements missed

### Password-Protected Sites
- **Scan Quality:** Not supported
- **Notes:** Only public pages can be scanned

---

## Best Practices for Users

### Before Scanning:
1. ✅ Verify URL is correct and accessible
2. ✅ Use the homepage or main landing page
3. ✅ Ensure site doesn't require login for main content
4. ✅ Check that site isn't under maintenance

### For Best Results:
1. ✅ Scan during off-peak hours if site is slow
2. ✅ Add multiple page URLs for comprehensive analysis
3. ✅ Re-scan periodically as website content changes
4. ✅ Download PDF reports for your records

---

## When to Escalate

**Escalate to Level 2 if:**
- Website is accessible in browser but consistently fails to scan
- Scan shows no content for a clearly populated website
- Technical error messages appear (not user-facing errors)
- User reports different behavior than expected based on plan

**Escalate to Level 3 if:**
- Multiple users report same scanning issue
- Suspected bug in scraper or AI analysis
- Infrastructure or API connectivity issues

---

**Related Articles:**
- `/kb/intelliscan/reports.md` - Report interpretation issues
- `/kb/intelliscan/QUICK_REFERENCE.md` - Quick troubleshooting
