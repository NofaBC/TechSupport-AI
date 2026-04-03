# CareerPilot AI - Salary Data Guide

**Product:** CareerPilot AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 3, 2026

---

## Overview

CareerPilot AI provides salary estimates and negotiation guidance based on aggregated market data. This guide explains data sources, coverage, and how to address common questions.

---

## Data Sources

CareerPilot salary data is aggregated from multiple reputable sources:

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| Levels.fyi | Tech salaries, equity data | Monthly |
| Glassdoor | Company reviews, salary reports | Monthly |
| Bureau of Labor Statistics (BLS) | US occupational data | Quarterly |
| LinkedIn Salary | Professional salaries | Quarterly |

**Last Full Update:** Q1 2026 (January 2026 data)

**Note:** Salary data is updated quarterly. Very recent job postings or market changes may not be reflected immediately.

---

## Data Limits

### Geographic Coverage

**Strong Coverage (High Confidence):**
- 🇺🇸 United States (all major metros)
- 🇬🇧 United Kingdom (London, major cities)
- 🇨🇦 Canada (Toronto, Vancouver, major cities)
- 🇦🇺 Australia (Sydney, Melbourne, major cities)

**Moderate Coverage:**
- 🇩🇪 Germany (Berlin, Munich)
- 🇫🇷 France (Paris)
- 🇳🇱 Netherlands (Amsterdam)
- 🇮🇳 India (Bangalore, Delhi, Mumbai)
- 🇸🇬 Singapore

**Limited Coverage:**
- Latin America (LATAM) - Brazil, Mexico only
- Middle East/Africa (MEA) - Limited to UAE
- Southeast Asia - Singapore, limited elsewhere
- Eastern Europe - Major capitals only

**If user is in limited coverage area:**
> "Salary data for your region may be less precise. We recommend cross-referencing with local job boards and industry reports for your specific market."

---

## Common Issues

### Salary Mismatch >30%

**Symptom:** User reports that salary estimate is significantly higher or lower than expected (more than 30% difference from personal experience or other sources).

**Troubleshooting Steps:**

1. **Verify exact job title entered**
   - "Software Engineer" vs "Senior Software Engineer" can differ by 40%+
   - "Manager" vs "Director" roles have large salary gaps
   - Ensure the title matches their actual target role

2. **Check seniority level**
   - Entry-level, Mid-level, Senior, Lead, Principal
   - Each level can represent 20-30% salary difference
   - User may need to adjust seniority selector

3. **Verify location**
   - San Francisco vs. Austin can differ by 30%+
   - Remote roles may use different pay bands
   - Check that the correct city/metro is selected

4. **Consider industry**
   - Big Tech (FAANG) pays significantly higher
   - Startups may have lower base but higher equity
   - Non-tech companies typically pay less for tech roles

**If mismatch persists after verification:**
- Our data represents market medians, not guarantees
- Individual offers vary based on company, negotiation, and candidate strength
- Recommend user research company-specific data on Levels.fyi or Glassdoor

---

### "Salary data not available"

**Causes:**
1. Niche or specialized job title not in database
2. Location not in our coverage area
3. Very new job title (emerging roles)

**Solutions:**
1. Try a more common/generic job title that matches the role
2. Select nearest major metro area for location
3. Look at similar roles for reference

**Example:**
- Instead of "AI Ethics Consultant" → try "AI Consultant" or "Ethics Compliance Specialist"
- Instead of "remote, Montana" → try nearest major city or "United States (National Average)"

---

### Equity/Stock Data Questions

**What we include:**
- Typical equity ranges for tech roles (RSUs, options)
- Vesting schedules (4-year with 1-year cliff standard)
- Equity as percentage of total compensation

**What we don't include:**
- Real-time stock prices
- Company-specific grant amounts
- Startup valuation estimates

**For equity questions:**
> "For detailed equity analysis, we recommend checking Levels.fyi for specific company data and using their total compensation calculator."

---

## Salary Negotiation Feature

### How It Works:
1. User enters current/target salary and job details
2. CareerPilot provides market comparison
3. Generates negotiation talking points
4. Suggests counter-offer ranges

### Common Questions:

**"Is this salary negotiable?"**
> Most professional salaries have 10-20% negotiation room. Use our talking points to make a data-backed case.

**"Should I share my current salary?"**
> In many US states, it's illegal for employers to ask. CareerPilot helps you redirect to market-rate discussions instead.

**"The range seems too wide"**
> Salary ranges reflect market variation. Your position in the range depends on experience, skills, and negotiation.

---

## Frequently Asked Questions

### "Why doesn't my salary match the estimate?"
Estimates are market medians. Your actual salary depends on:
- Company size and funding
- Your specific experience and skills
- Cost of living adjustments
- Negotiation outcome
- Bonus and equity components

### "How often is data updated?"
Quarterly. Q1 data available in February, Q2 in May, etc.

### "Can I trust this for negotiation?"
Yes, as a starting point. We recommend:
1. Cross-reference with Glassdoor, Levels.fyi
2. Research specific company pay bands
3. Talk to recruiters or industry contacts

### "Why is [Company X] salary different from what I've heard?"
Company-specific salaries vary widely. Our data shows market medians, not company-specific offers. For company-specific data, check Levels.fyi.

---

## When to Escalate

**Escalate to Level 2 if:**
- User reports consistently wrong data for common roles/locations
- Salary feature not loading or showing errors
- Data appears outdated (showing last year's numbers)

**Escalate to Level 3 if:**
- Multiple users report same data accuracy issue
- Request to add new region or data source
- Suspected data integrity issue

---

**Related Articles:**
- `LEVEL1_BASIC_SUPPORT.md` - General feature questions
- `LEVEL2_TROUBLESHOOTING.md` - Technical issues with salary feature
