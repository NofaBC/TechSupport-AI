# Dlyn AI™ - Level 2 Troubleshooting Knowledge Base

**Support Level:** Level 2 (AI-Advanced)  
**Target Resolution Time:** 2-5 minutes  
**Handles:** Complex technical issues requiring diagnosis and multi-step solutions  
**Product:** Dlyn AI™  
**Version:** 1.0  
**Last Updated:** March 22, 2026

---

## Level 2 Support Scope

**HANDLE:**
- Technical issues with multiple potential causes
- Features not working as expected after basic troubleshooting
- Data not saving or syncing correctly
- Performance and speed issues
- Error messages requiring diagnosis
- Multi-step troubleshooting workflows
- Integration problems (Firebase, OpenAI, JSearch API)

**Prerequisites for Level 2:**
- User already tried Level 1 basic solutions
- Issue persists after refresh/cache clear/browser change
- Problem is reproducible or consistent
- User can describe symptoms clearly

**DO NOT HANDLE (Escalate to Level 3):**
- Billing/payment processing errors
- Security vulnerabilities
- GDPR/data deletion requests
- Confirmed bugs requiring code fixes
- Issues affecting multiple users simultaneously
- Account access completely blocked

---

## Diagnostic Framework

### Step 1: Gather Information
Ask these questions to diagnose:
1. **When did the issue start?** (Helps identify if it's a recent change)
2. **What browser and device?** (Compatibility issues)
3. **What exactly happens?** (Error message, blank screen, slow loading, etc.)
4. **Can you reproduce it?** (Consistent vs. intermittent)
5. **Have you tried basic fixes?** (Refresh, cache clear, different browser)

### Step 2: Identify Issue Category
- Authentication/Login
- Data Persistence (not saving)
- API Integration (job search, cover letters, interview coach)
- Performance (slow loading)
- PDF Export
- UI/Display Issues

### Step 3: Apply Targeted Solution
Use relevant troubleshooting section below

### Step 4: Verify Resolution
- Ask user to test again
- Confirm issue is resolved
- If not resolved → Escalate to Level 3

---

## Account & Authentication Issues

### Issue: Can't Sign In - "Invalid Email or Password"

**Diagnostic Questions:**
1. Are you certain about your email? (Check for typos, extra spaces)
2. Is Caps Lock on? (Passwords are case-sensitive)
3. Did you recently change your password?
4. Are you copying/pasting the password? (May include extra characters)

**Troubleshooting Steps:**

**Step 1: Verify Email Format**
- Must be valid format: user@domain.com
- No spaces before or after
- Check for common typos (.con instead of .com)

**Step 2: Password Reset**
- Currently: Password reset via email is in development
- Workaround: Create new account with different email
- Future: Self-service password reset coming soon

**Step 3: Browser Issues**
- Clear browser cache and cookies
- Try incognito/private mode
- Try different browser (Chrome recommended)

**Step 4: Account Lockout**
- After 5 failed attempts: Wait 15 minutes
- Do not keep retrying (extends lockout)

**If Still Failing:**
→ **Escalate to Level 3** - Possible account access issue requiring manual intervention

---

### Issue: Session Keeps Expiring / Getting Logged Out

**Symptoms:**
- User logged in, then suddenly logged out
- "Session expired" message
- Redirected to login page unexpectedly

**Causes:**
1. Browser blocking cookies/localStorage
2. Incognito/Private mode (session not persisted)
3. Firebase Auth token expiration
4. Multiple tabs/devices conflicting

**Troubleshooting Steps:**

**Step 1: Check Browser Settings**
- Ensure cookies are enabled
- Allow localStorage for career-pilot-ai-gamma.vercel.app
- Chrome: Settings → Privacy → Site Settings → Cookies → Allow all

**Step 2: Exit Incognito Mode**
- Regular browser window recommended
- Incognito doesn't persist sessions reliably

**Step 3: Clear Cache & Re-Login**
```
1. Sign out completely
2. Clear browser cache
3. Close all Dlyn AI tabs
4. Open fresh browser window
5. Sign in again
```

**Step 4: Single Device**
- If using multiple devices, sign out of others
- Firebase Auth may revoke tokens on multiple simultaneous logins

**If Issue Persists:**
→ **Escalate to Level 3** - Potential Firebase Auth configuration issue

---

## Job Search Issues

### Issue: Getting 0% Fit Scores on All Jobs

**Symptoms:**
- Every job shows 0% fit score
- No skills matching
- All jobs appear as bad matches

**Root Causes:**
1. User profile has no skills entered
2. Skills format incorrect (not comma-separated)
3. Skills too specific/niche (no matches in job descriptions)
4. Skill matching algorithm not recognizing skill variations

**Troubleshooting Steps:**

**Step 1: Verify Profile Skills**
```
1. Go to Dashboard → Profile icon → Edit Profile
2. Check "Skills" field
3. Must be comma-separated (e.g., "Python, React, AWS")
4. At least 3-5 skills recommended
```

**Common Mistakes:**
- ❌ Semicolon separated: "Python; React; AWS"
- ❌ Line breaks: Skills on separate lines
- ❌ Too few skills: Only 1-2 skills entered
- ✅ Correct: "Python, JavaScript, React, Node.js, PostgreSQL"

**Step 2: Use Common Skill Names**
- Use industry-standard terms
- Example: "JavaScript" not "JS" or "ECMAScript"
- Example: "Python" not "Python 3.11"
- Generic > Specific for better matching

**Step 3: Add More Skills**
- Minimum 5 skills recommended
- Include:
  - Programming languages
  - Frameworks/tools
  - Soft skills (Communication, Leadership)
  - Domain knowledge

**Step 4: Test with Different Target Role**
- Try changing target role to see if results improve
- Some roles have limited job availability

**If Still 0% Fit Scores:**
→ **Escalate to Level 3** - Potential fit score algorithm bug

---

### Issue: No Jobs Showing Up / Empty Search Results

**Symptoms:**
- Click "Search Jobs"
- No results appear
- Page loads but empty list

**Root Causes:**
1. No jobs available for target role + location combination
2. JSearch API issue/rate limit
3. Profile not set up completely
4. Network connectivity issue

**Troubleshooting Steps:**

**Step 1: Verify Profile Completion**
```
Required fields:
✅ Target Role
✅ Location
✅ Years of Experience
✅ Skills

If any missing → Complete profile first
```

**Step 2: Try Broader Search**
- Location: Try "Remote" or major city
- Target Role: Try more generic title
  - Instead of: "Senior Full Stack Engineer with ML Experience"
  - Try: "Software Engineer"

**Step 3: Check API Status**
- JSearch API may have temporary outage
- Wait 5 minutes and try again
- Try different time of day (API rate limits reset)

**Step 4: Network Check**
- Check internet connection
- Try on different network (mobile hotspot)
- Disable VPN if active

**Step 5: Browser Console Check**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Search Jobs"
4. Look for errors (red text)
5. Screenshot and share with Level 3 if errors present
```

**If Still No Results:**
→ **Escalate to Level 3** - Potential JSearch API integration issue

---

### Issue: Jobs Showing Wrong Location

**Symptoms:**
- Searched for "New York" jobs
- Results show "California" or other states
- Location mismatch

**Root Causes:**
1. JSearch API returns jobs based on keyword matching
2. "Remote" jobs may show in any location
3. Profile location vs. search query mismatch

**Troubleshooting Steps:**

**Step 1: Verify Profile Location**
```
1. Go to Edit Profile
2. Check "Location" field
3. Format: "City, State" or "City, Country"
4. Examples:
   - ✅ "San Francisco, CA"
   - ✅ "London, UK"
   - ✅ "Remote"
   - ❌ "SF"
   - ❌ "California" (too broad)
```

**Step 2: Location Format Standards**
- US: "City, STATE" (use 2-letter state code)
- UK: "City, UK" or "City, England"
- Canada: "City, Province" or "City, Canada"
- Remote: Just "Remote"

**Step 3: Filter Results Manually**
- Some remote jobs may appear in results
- Check job location field in each listing
- Focus on jobs explicitly in your target location

**If Location Consistently Wrong:**
→ **Escalate to Level 3** - Potential JSearch API query formatting issue

---

## Resume Builder Issues

### Issue: Resume Data Not Saving

**Symptoms:**
- User fills in resume fields
- Clicks "Save"
- Refreshes page and data is gone
- Or: Get error message "Failed to save"

**Root Causes:**
1. Firebase Firestore connection issue
2. User not authenticated properly
3. Browser localStorage blocked
4. Network timeout during save
5. Large data payload (very long descriptions)

**Troubleshooting Steps:**

**Step 1: Verify Authentication**
```
1. Check if user is signed in (look for profile icon)
2. If not signed in → Sign in first
3. Resume data requires authentication
```

**Step 2: Browser Storage Check**
```
1. Enable cookies and localStorage
2. Chrome: Settings → Privacy → Allow all cookies
3. Safari: Preferences → Privacy → Uncheck "Block all cookies"
```

**Step 3: Network During Save**
```
1. Fill in one small section
2. Click Save
3. Wait for confirmation message
4. Check if that section persists
5. If yes → Problem is with large data
```

**Step 4: Reduce Content Size**
- If descriptions are very long (500+ words), split them up
- Firebase has document size limits (~1MB)
- Break work experience into shorter bullet points

**Step 5: Try Different Browser**
- Test in Chrome (most compatible)
- Clear cache first
- Private/Incognito mode to test without extensions

**Step 6: Check Browser Console**
```
1. Open DevTools (F12)
2. Console tab
3. Click Save
4. Look for Firestore errors
5. Screenshot any error messages
```

**If Still Not Saving:**
→ **Escalate to Level 3** with console error screenshots - Potential Firestore write permission issue

---

### Issue: PDF Export Shows Blank Pages or Missing Data

**Symptoms:**
- Click "Export to PDF"
- PDF downloads but is blank
- Or: PDF is missing sections
- Or: Formatting is broken

**Root Causes:**
1. Resume data not saved to Firestore yet
2. jsPDF rendering issue
3. Browser blocking PDF generation
4. Special characters breaking PDF render
5. Very long content exceeding page limits

**Troubleshooting Steps:**

**Step 1: Save Before Export**
```
1. Fill in all resume sections
2. Click "Save" and wait for confirmation
3. THEN click "Export to PDF"
4. Don't skip the Save step
```

**Step 2: Check Resume Preview**
- Before exporting, scroll through resume builder
- Verify all sections have data visible on screen
- If data missing on screen → It won't be in PDF

**Step 3: Try Different Browser**
- Chrome: Best PDF rendering
- Firefox: Second best
- Safari: May have issues
- Edge: Usually works well

**Step 4: Disable Browser Extensions**
```
1. Open incognito/private mode
2. Sign in to Dlyn AI
3. Try export again
4. If it works → Extension was blocking it
```

**Step 5: Check for Special Characters**
- Avoid emojis in resume fields
- Avoid special symbols: ©, ®, ™, •
- Stick to standard ASCII characters
- If you used special characters → Remove and try again

**Step 6: Reduce Content Length**
- Very long descriptions may overflow pages
- Try shortening work experience descriptions
- Aim for 2-3 bullet points per job

**If PDF Still Broken:**
→ **Escalate to Level 3** - Potential jsPDF library issue or need alternative export method

---

## Cover Letter Generation Issues

### Issue: Cover Letter Taking Very Long to Generate (>30 seconds)

**Symptoms:**
- Click "Smart Apply"
- Loading spinner for 30+ seconds
- Eventually times out or completes very slowly

**Root Causes:**
1. OpenAI API slow response
2. Network latency
3. OpenAI API rate limits
4. Very long job description overwhelming GPT-4o
5. Server timeout configuration

**Troubleshooting Steps:**

**Step 1: Check Network**
- Test internet speed (speedtest.net)
- If <1 Mbps → Network issue
- Try different network (mobile hotspot)

**Step 2: Wait It Out**
- GPT-4o can take 10-20 seconds normally
- If <30 seconds → This is expected behavior
- If >60 seconds → Problem

**Step 3: Retry**
- Cancel and try again
- Sometimes first request is slow, second is faster
- OpenAI API may have temporary slowdown

**Step 4: Try Shorter Job Description**
- Very long job posts (2000+ words) take longer
- OpenAI has to process more tokens
- This is expected, not a bug

**If Consistently >1 Minute:**
→ **Escalate to Level 3** - Potential server timeout configuration or OpenAI API quota issue

---

### Issue: Cover Letter is Generic / Not Personalized

**Symptoms:**
- Generated cover letter doesn't mention job specifics
- Feels template-like
- Doesn't reference user's skills/experience

**Root Causes:**
1. User resume not filled out completely
2. Job description very vague/short
3. GPT-4o prompt may need improvement
4. No resume data linked to user account

**Troubleshooting Steps:**

**Step 1: Complete Resume Builder**
```
1. Go to Resume Builder
2. Fill in ALL sections:
   - Personal Info
   - Professional Summary
   - Work Experience (at least 1-2 jobs)
   - Education
   - Skills
3. Click Save
4. THEN generate cover letter
```

**Step 2: Check Job Description**
- Is job description detailed?
- If very short (1-2 sentences) → Cover letter will be generic
- Look for jobs with detailed descriptions

**Step 3: Regenerate**
- Delete existing cover letter
- Click "Smart Apply" again
- GPT-4o may produce different output

**Step 4: Manual Editing**
- Use generated cover letter as starting point
- Add specific examples from your experience
- Personalize the intro/closing paragraphs

**If Always Generic:**
→ **Escalate to Level 3** - May need GPT-4o prompt optimization

---

## Interview Coach Issues

### Issue: Interview Coach Won't Start / Stuck Loading

**Symptoms:**
- Click "Start Interview"
- Loading spinner appears
- Nothing happens
- Or: Error message

**Root Causes:**
1. OpenAI API connection issue
2. Authentication token expired
3. Browser blocking microphone (if voice feature enabled)
4. Network timeout
5. Credit balance issue

**Troubleshooting Steps:**

**Step 1: Check Credit Balance**
```
1. Look at credit balance in top right
2. Interview Coach costs 25 credits per session
3. If <25 credits → Purchase credits or upgrade plan
```

**Step 2: Refresh Page**
```
1. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Try starting interview again
```

**Step 3: Try Different Interview Type**
- If "Behavioral" stuck → Try "General"
- If "Technical" stuck → Try "Behavioral"
- Helps identify if issue is type-specific

**Step 4: Check Browser Console**
```
1. Open DevTools (F12)
2. Console tab
3. Click "Start Interview"
4. Look for errors
5. Screenshot errors
```

**Step 5: Disable Extensions**
- Try in incognito/private mode
- Some extensions block WebSocket connections
- Interview Coach may use real-time connections

**If Still Won't Start:**
→ **Escalate to Level 3** with console screenshots - Potential OpenAI API or WebSocket issue

---

### Issue: Interview Responses Cut Off / Incomplete

**Symptoms:**
- AI interviewer asks question
- User responds
- AI's next question is cut off mid-sentence
- Or: Response stops abruptly

**Root Causes:**
1. Token limit reached (max_tokens in API call)
2. Network interruption during streaming
3. OpenAI API error
4. Browser tab lost focus (stops streaming)

**Troubleshooting Steps:**

**Step 1: Keep Tab Active**
- Don't switch tabs during interview
- Keep browser window in focus
- Some streaming APIs pause when tab inactive

**Step 2: Refresh and Restart**
```
1. Refresh page
2. Start new interview session
3. Keep responses concise
```

**Step 3: Check Internet Stability**
- Stable connection required for streaming
- Test on different network if available
- Avoid Wi-Fi with intermittent drops

**Step 4: Shorter User Responses**
- Very long user answers may cause timeout
- Aim for 2-3 sentence responses
- This also simulates real interviews better

**If Consistently Cut Off:**
→ **Escalate to Level 3** - Potential max_tokens configuration issue in API

---

## Performance & Speed Issues

### Issue: Dashboard Loading Very Slowly

**Symptoms:**
- Dashboard takes >10 seconds to load
- Spinning loader for extended period
- Eventually loads but very slow

**Root Causes:**
1. Large number of applications tracked (100+)
2. Firestore query slow
3. Network latency
4. Browser cache bloated
5. Too many browser extensions

**Troubleshooting Steps:**

**Step 1: Clear Browser Cache**
```
1. Chrome: Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Time range: All time
4. Clear data
5. Refresh dashboard
```

**Step 2: Disable Extensions**
- Test in incognito mode
- Extensions like ad blockers can slow React apps
- Disable all extensions and test

**Step 3: Check Network Speed**
- Run speedtest.net
- If <5 Mbps → Network is bottleneck
- Try different network

**Step 4: Different Browser**
- Test in Chrome (fastest)
- Avoid Firefox (slower React rendering)
- Edge is good alternative

**Step 5: Reduce Application History**
- If you have 50+ tracked applications
- Performance may degrade
- Feature: Ability to archive old applications (coming soon)

**If Still Slow (>15 seconds):**
→ **Escalate to Level 3** - Potential database query optimization needed

---

## Browser & Device Compatibility

### Issue: Features Not Working on Mobile

**Symptoms:**
- Mobile browser (Chrome, Safari on iOS/Android)
- Buttons don't click
- Forms don't submit
- Layout broken

**Current Status:**
Dlyn AI is optimized for desktop browsers.

**Mobile Support:**
- ⚠️ Limited mobile support currently
- Some features may not work on small screens
- Responsive design in progress

**Workaround:**
- Use desktop or laptop browser
- Or: Enable "Desktop Site" mode on mobile
  - Chrome Android: Menu → Desktop site checkbox
  - Safari iOS: AA button → Request Desktop Website

**If Critical Mobile Issue:**
→ **Escalate to Level 3** - Mobile optimization is on roadmap

---

## Credit & Billing Issues (Level 2 Scope)

### Issue: Credits Not Deducted After Action

**Symptoms:**
- User performs action (job search, cover letter)
- Credits don't decrease
- Or: Credits show wrong amount

**Scope:**
- Level 2: Investigate and diagnose
- Level 3: Fix billing issues, refunds

**Troubleshooting Steps:**

**Step 1: Refresh Dashboard**
- Credit balance may be cached
- Hard refresh: Ctrl+Shift+R
- Check balance again

**Step 2: Check Browser Console for Errors**
```
1. F12 → Console
2. Perform action
3. Look for credit deduction errors
4. Screenshot errors
```

**Step 3: Verify Action Completed**
- Did job search actually run?
- Did cover letter generate?
- If action failed → Credits shouldn't deduct

**If Credits Still Wrong:**
→ **Escalate to Level 3** with:
- User email
- Action performed
- Expected credit deduction
- Actual credit balance
- Screenshots

---

### Issue: Credits Deducted but Action Failed

**Symptoms:**
- User clicks "Search Jobs" (8 credits)
- Credits deducted
- But: No results shown / Error occurred
- User charged without receiving service

**Scope:**
- Level 2: Confirm issue and document
- Level 3: Credit refund

**Troubleshooting Steps:**

**Step 1: Confirm Failure**
```
Ask user:
1. What action did you try?
2. How many credits were deducted?
3. What error message (if any)?
4. Screenshot of current credit balance
```

**Step 2: Check if Result Delayed**
- Sometimes results load slowly
- Ask user to wait 30 seconds and refresh
- Check if results appeared

**Step 3: Verify Credit Balance**
- Check Settings → Credit History (if available)
- Confirm exact deduction amount

**Step 4: Document and Escalate**
→ **Escalate to Level 3** with:
```
User: [email]
Action: [Job Search / Cover Letter / Interview Coach]
Credits Deducted: [amount]
Result: [Failed - no output]
Error Message: [if any]
Timestamp: [approximate time]

REQUEST: Credit refund of [X] credits
```

Level 3 will manually adjust credit balance.

---

## Error Messages

### Error: "Failed to Load Profile"

**Meaning:** Firestore query for user profile failed

**Troubleshooting:**
1. Check authentication (sign out and back in)
2. Clear cache
3. Check browser console for Firestore errors
4. If persists → **Escalate to Level 3** - Database permission issue

---

### Error: "OpenAI API Error"

**Meaning:** Call to GPT-4o failed (cover letter or interview coach)

**Troubleshooting:**
1. Wait 2 minutes and retry
2. OpenAI may have temporary outage
3. Check https://status.openai.com
4. If persistent → **Escalate to Level 3** - API key or quota issue

---

### Error: "Job Search Failed"

**Meaning:** JSearch API call failed

**Troubleshooting:**
1. Verify profile is complete
2. Retry with different target role/location
3. Wait 5 minutes (rate limits)
4. If persists → **Escalate to Level 3** - JSearch API issue

---

### Error: "Insufficient Credits"

**Meaning:** User tried to perform action without enough credits

**Troubleshooting:**
1. Check credit balance
2. User needs to:
   - Upgrade plan, OR
   - Purchase credit top-up
3. Explain credit costs:
   - Job Search: 8 credits
   - Cover Letter: 15 credits
   - Interview Coach: 25 credits
4. Not an error - working as designed

---

## When to Escalate to Level 3

**Immediate Escalation (Do Not Attempt Level 2 Fix):**
- ❌ Billing disputes ("I was charged twice")
- ❌ Payment processing errors ("Card declined but valid")
- ❌ Security concerns ("Someone accessed my account")
- ❌ GDPR requests ("Delete my data")
- ❌ Suspected data breach
- ❌ Feature requests
- ❌ User explicitly asks for human support

**Escalate After Troubleshooting:**
- ✅ Issue persists after all Level 2 steps
- ✅ Console shows errors you can't resolve
- ✅ Potential bug confirmed
- ✅ Database or API integration issue suspected
- ✅ Multiple users report same issue

**Escalation Template:**
```
🔼 ESCALATING TO LEVEL 3 (Human Support via Slack)

**User:** [email]
**Issue:** [Brief summary]
**Troubleshooting Completed:**
  - [Step 1]
  - [Step 2]
  - [Step 3]

**Diagnosis:** [Your assessment]
**Evidence:** [Screenshots, error messages, console logs]
**Urgency:** [Low/Medium/High]

**Recommended Action:** [What Level 3 should do]

This case has been forwarded to our engineering team.
Expected response time: 1-24 hours.
You'll receive an update at [user email].
```

---

**End of Level 2 Knowledge Base**
