# Confidence Scoring

Point values and tier thresholds used in Phase 3. Score each candidate pair 0–100 by
summing every condition that applies, then classify with the tier table.

## Contents
- [Contact Scoring Matrix](#contact-scoring-matrix)
- [Company Scoring Matrix](#company-scoring-matrix)
- [Confidence Tiers](#confidence-tiers)

---

## Contact Scoring Matrix

| Condition | Points |
|---|---|
| Exact email match | +60 |
| Email domain match (same company) | +20 |
| First name exact match | +10 |
| Last name exact match | +15 |
| First name fuzzy match (distance ≤ 2) | +5 |
| Phone match (digits only) | +20 |
| Company name match (normalized) | +10 |
| Job title match (same function) | +5 |
| Created within 30 days of each other | +5 |
| Same owner | +3 |
| Different lifecycle stage | −10 |
| Different associated company | −5 |

---

## Company Scoring Matrix

| Condition | Points |
|---|---|
| Exact domain match | +70 |
| Normalized name exact match | +50 |
| Normalized name fuzzy match (distance ≤ 3) | +25 |
| Phone match | +20 |
| City + country match | +10 |
| Industry match | +8 |
| Employee count within 20% | +5 |
| 2+ shared contacts | +15 |
| Created within 60 days | +5 |
| Very different employee counts (>5x) | −15 |
| Different countries | −20 |

---

## Confidence Tiers

| Score | Tier | Action |
|---|---|---|
| 80–100 | HIGH — Confirmed duplicate | Safe to merge automatically |
| 50–79 | MEDIUM — Likely duplicate | Review before merging |
| 20–49 | LOW — Possible duplicate | Manual investigation required |
| < 20 | Not a duplicate | Discard pair |
