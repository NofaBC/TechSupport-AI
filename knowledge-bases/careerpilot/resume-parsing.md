# CareerPilot AI - Resume Parsing Troubleshooting

**Product:** CareerPilot AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 3, 2026

---

## Common Parsing Errors

### "Parser missed contract work"
**Symptom:** Contract roles, freelance work, or consulting positions are not appearing in the parsed resume.

**Root Cause:** The parser looks for standard section headers like "Work Experience" or "Professional Experience".

**Solution:**
1. Use "Work Experience" as your section header (not "Contract Roles", "Freelance Work", or "Consulting")
2. Format contract positions the same as regular employment:
   ```
   Company Name | Contract
   Role Title
   Start Date - End Date
   • Accomplishments
   ```
3. Re-upload the resume after making changes

**Prevention:** Always use standard section headers that ATS systems recognize.

---

### "PDF with columns fails"
**Symptom:** Multi-column resume layouts result in jumbled or incomplete parsing.

**Root Cause:** PDF parsers read text left-to-right, top-to-bottom. Multi-column layouts cause text from different sections to intermix.

**Solution:**
1. Export resume as single-column format before uploading
2. If using Word: Save As → DOCX (single column layout)
3. If using Google Docs: Export as DOCX
4. Avoid templates with sidebars or multiple columns

**Best Practice:** Use a simple, single-column resume template for optimal parsing accuracy.

---

### "Scanned PDF not parsed"
**Symptom:** Resume uploads but appears empty or shows "Unable to extract text".

**Root Cause:** The PDF is an image scan (not text-selectable). OCR is required but not always accurate.

**How to Verify:**
1. Open the PDF
2. Try to select/highlight text with your cursor
3. If you cannot select individual words, it's image-based

**Solution:**
1. Re-create the resume in a text editor (Word, Google Docs)
2. Or use OCR software to convert to selectable text:
   - Adobe Acrobat: Edit PDF → Recognize Text
   - Free option: smallpdf.com/pdf-to-word
3. Upload the text-selectable version

**Note:** Scanned PDFs from old documents or physical copies will always have this issue.

---

## Universal Parsing Fixes

### Before Uploading Any Resume:

1. **Verify text is selectable** - Open PDF and try to highlight text
2. **Use standard section headers:**
   - Work Experience (or Professional Experience)
   - Education
   - Skills
   - Certifications
3. **Avoid:**
   - Multi-column layouts
   - Text boxes (use regular paragraphs)
   - Headers/footers with important info
   - Tables for work history
   - Images embedded in the resume
4. **Preferred formats:** .docx (best), .pdf (text-based), .txt

### File Size Limits:
- Maximum file size: 5MB
- Maximum pages: 10 pages
- Recommended: 1-2 pages for best parsing

---

## Error Messages Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| "Unable to extract text" | Image-based PDF | Convert to text-selectable PDF |
| "File format not supported" | Wrong file type | Use .pdf, .docx, or .txt |
| "File too large" | Over 5MB | Compress or simplify resume |
| "Parsing incomplete" | Complex formatting | Simplify to single column |
| "Section not found" | Non-standard headers | Use standard headers |

---

## When to Escalate

**Escalate to Level 2 if:**
- Parser worked before but suddenly fails for the same file
- Text is selectable but parsing still fails
- Error persists after trying all solutions above

**Escalate to Level 3 if:**
- Multiple users report same parsing issue
- Parsing fails for standard .docx files

---

**Related Articles:**
- `/kb/careerpilot/ats-scoring.md` - Understanding ATS compatibility scores
- `LEVEL2_TROUBLESHOOTING.md` - Advanced troubleshooting workflows
