# Magazinify AI - Flipbook Viewer Troubleshooting

**Product:** Magazinify AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 28, 2026

---

## How the Flipbook Viewer Works

Magazinify AI uses `react-pageflip` to render interactive, page-turning digital magazines. The viewer:
- Loads dynamically (client-side only, no SSR)
- Displays magazine pages as interactive flipbook
- Supports mouse/touch navigation
- Works on desktop and mobile browsers

---

## Common Viewer Issues

### Pages not loading / Blank viewer
**Symptom:** User sees loading spinner indefinitely or blank white area.

**Root Cause:**
- JavaScript failed to load
- Browser blocking third-party scripts
- Slow network connection
- Incompatible browser

**Solution:**
1. Refresh the page (Ctrl/Cmd + R)
2. Try hard refresh (Ctrl/Cmd + Shift + R)
3. Clear browser cache:
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
4. Try different browser (Chrome, Edge, Firefox recommended)
5. Check internet connection stability

**Escalate to Level 2 if:**
- Issue persists across multiple browsers
- Error visible in browser console (F12)

---

### Flipbook not flipping / Stuck pages
**Symptom:** Cannot turn pages, click/swipe doesn't work.

**Root Cause:**
- Touch events not registering
- Mobile browser limitations
- JavaScript error blocking interaction

**Solution for Desktop:**
1. Click on page edges (left/right sides) to flip
2. Try arrow keys (← →)
3. Disable browser extensions temporarily

**Solution for Mobile:**
1. Use swipe gesture (left/right) not tap
2. Try landscape orientation for better touch targets
3. Avoid zooming - keep at default scale
4. Use Chrome or Safari mobile

**Best Practice:** Desktop provides optimal flipbook experience.

---

### Pages appear out of order
**Symptom:** Magazine pages display in wrong sequence.

**Root Cause:**
- Data corruption during generation
- Caching issue

**Solution:**
1. Hard refresh the page
2. View in incognito/private window
3. Report specific page numbers that are wrong

**Escalate to Level 2 if:**
- Pages consistently out of order after refresh
- Multiple users report same issue

---

### Slow page transitions
**Symptom:** Page flip animation is laggy or choppy.

**Root Cause:**
- Low-powered device
- Large image files
- Too many browser tabs open

**Solution:**
1. Close other browser tabs
2. Try on a different device
3. Wait for full page load before interacting
4. Disable hardware acceleration if on old computer

**Note:** Some lag on mobile is expected due to image sizes.

---

### Magazine shows "Not Found" or "Not Available"
**Symptom:** Shareable link shows error page.

**Root Cause:**
- Issue not published yet (status = draft)
- Wrong URL/tenantId
- Issue deleted by user

**Solution:**
1. Verify URL is correct (check for typos)
2. Confirm magazine is published (not draft)
3. Ask owner to share updated link

**For Owner:**
1. Go to `/magazines/[yearMonth]`
2. Publish the issue if still in draft
3. Copy shareable URL and redistribute

---

## Browser Compatibility

### Supported Browsers
| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ Full | ✅ Good | Recommended |
| Edge | ✅ Full | ✅ Good | Recommended |
| Firefox | ✅ Full | ⚠️ Minor issues | Touch may be less responsive |
| Safari | ✅ Full | ✅ Good | Best for iOS |
| Opera | ✅ Full | ⚠️ Minor issues | - |
| IE11 | ❌ Not supported | - | Upgrade browser |

### Known Mobile Limitations
- Page flip animation simpler than desktop
- Touch targets smaller on phones
- Landscape orientation recommended
- Some older Android devices may have rendering issues

---

## Accessibility Issues

### Screen reader not reading content
**Symptom:** Assistive technology cannot access magazine text.

**Root Cause:** 
- Flipbook images are rendered, not text
- No alt text for page images

**Current Limitation:** 
- Magazine content is image-based
- Full accessibility support is planned

**Workaround:**
- Contact support for text-only version if needed

---

### Zoom not working
**Symptom:** Cannot zoom into magazine pages.

**Root Cause:** Flipbook component overrides browser zoom.

**Workaround:**
1. Use browser zoom before entering viewer (Ctrl/Cmd +/-)
2. View on larger screen for better readability
3. Request specific pages as images if needed

---

## Performance Optimization Tips

For users experiencing slow loading:

1. **Close unnecessary tabs** - Free up browser memory
2. **Use wired connection** - More stable than WiFi
3. **Avoid peak hours** - Server load affects delivery
4. **Update browser** - Latest versions have better performance
5. **Disable extensions** - Ad blockers can interfere

---

## When to Escalate

**Escalate to Level 2 if:**
- Viewer completely non-functional on supported browser
- Error messages visible in console
- Multiple pages corrupted or missing
- Issue affects multiple users viewing same magazine

**Escalate to Level 3 if:**
- react-pageflip component errors
- CDN/hosting issues suspected
- Systematic failure across all magazines

---

**Related Articles:**
- `/kb/magazinify/magazine-generation.md` - Generation process
- `/kb/magazinify/billing.md` - Plan features
