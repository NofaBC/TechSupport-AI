# Dlyn AI - Quick Reference Troubleshooting Guide

**Product:** Dlyn AI  
**Support Level:** Level 1  
**Last Updated:** April 6, 2026

---

> **Purpose:** Fast lookup for common issues. For detailed context, see linked full articles.

---

## Resume Parsing Issues

### Issue: Parser missed contract work
**Cause:** Non-standard section headers (e.g., "Contract Roles")

**Fix:**
1. Rename section to "Work Experience"
2. Re-upload resume

**If Not Resolved:**
- Convert resume to DOCX format and retry

**Escalate:**
- If still failing after DOCX conversion

📄 *Full guide: `/kb/Dlyn/resume-parsing.md`*

---

### Issue: PDF with columns fails
**Cause:** Multi-column layouts confuse parser

**Fix:**
1. Open resume in Word/Google Docs
2. Convert to single-column layout
3. Export as DOCX
4. Re-upload

**Escalate:**
- If single-column DOCX still fails

📄 *Full guide: `/kb/Dlyn/resume-parsing.md`*

---

### Issue: Scanned PDF not parsed
**Cause:** File is image-based (not text-readable)

**Fix:**
1. Open in OCR tool (Adobe, Google Drive OCR)
2. Convert to text-selectable PDF or DOCX
3. Re-upload

**Escalate:**
- If OCR version still fails

📄 *Full guide: `/kb/Dlyn/resume-parsing.md`*

---

## Interview Simulation Microphone Issues

### Issue: Chrome microphone not working
**Cause:** Browser permissions blocked

**Fix:**
1. Open Chrome Settings
2. Go to Privacy & Security → Site Settings → Microphone
3. Allow access for Dlyn.ai
4. Refresh page

**Escalate:**
- If microphone still not detected after refresh

📄 *Full guide: `/kb/Dlyn/interview-sim.md`*

---

### Issue: Firefox microphone blocked
**Cause:** Permission not granted

**Fix:**
1. Click 🔒 icon in address bar
2. Open Permissions
3. Allow microphone access
4. Refresh page

**Escalate:**
- If issue persists after permission change

📄 *Full guide: `/kb/Dlyn/interview-sim.md`*

---

## ATS Score Interpretation

### Issue: Score around 65%
**Cause:** Formatting issues (text boxes, tables)

**Fix:**
1. Remove text boxes and tables
2. Use plain text formatting
3. Re-run scoring

**Escalate:**
- If score does not improve after formatting cleanup

📄 *Full guide: `/kb/Dlyn/ats-scoring.md`*

---

### Issue: Score 85%+
**Meaning:** Resume is ATS-friendly

**Action:**
- Safe to use for applications

📄 *Full guide: `/kb/Dlyn/ats-scoring.md`*

---

### Issue: Low score despite good content
**Cause:** Hidden formatting elements

**Fix:**
1. Convert resume to plain text
2. Rebuild formatting using bold headers only
3. Avoid columns/tables

**Escalate:**
- If score remains low after rebuild

📄 *Full guide: `/kb/Dlyn/ats-scoring.md`*

---

## Salary Data Questions

### Issue: Salary estimate seems incorrect
**Cause:** Title or seniority mismatch

**Fix:**
1. Verify exact job title
2. Confirm seniority level
3. Re-run search

**Escalate:**
- If mismatch exceeds 30% after correction

📄 *Full guide: `/kb/Dlyn/salary-data.md`*

---

### Issue: Limited data for region
**Cause:** Coverage gaps in LATAM/MEA

**Fix:**
- Use broader job title or global averages

**Escalate:**
- If no data returned

📄 *Full guide: `/kb/Dlyn/salary-data.md`*

---

### Data Sources Reference
| Source | Update Frequency |
|--------|------------------|
| Levels.fyi | Monthly |
| Glassdoor | Monthly |
| BLS | Quarterly |

---

## Authentication Issues

### Issue: Cannot log in
**Fix:**
1. Click "Forgot password"
2. Reset via email
3. Try logging in again

**Escalate:**
- If reset email not received within 5 minutes

📄 *Full guide: `/kb/factory-wide/auth.md`*

---

## Escalation Summary

| Issue Category | Escalate When |
|----------------|---------------|
| Resume Parsing | DOCX conversion still fails |
| Microphone | Permissions correct but still not working |
| ATS Score | Score unchanged after formatting fixes |
| Salary Data | >30% mismatch persists or no data returned |
| Authentication | Reset email not received in 5 min |

---

**Related Full Articles:**
- `/kb/Dlyn/resume-parsing.md`
- `/kb/Dlyn/interview-sim.md`
- `/kb/Dlyn/ats-scoring.md`
- `/kb/Dlyn/salary-data.md`
- `/kb/factory-wide/auth.md`
