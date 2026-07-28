# Outbound Benchmarks

Full lemlist data (244,000+ campaigns, 249M+ emails sent) behind each rule in SKILL.md
Step 2. Load this file when designing the sequence architecture — the numbers below are
what populate "Expected global reply rate" and the timing fields in the output.

## Contents

- [Rule 1 — Lead with LinkedIn](#rule-1--always-lead-with-linkedin-if-available)
- [Rule 2 — Channel mix and calls](#rule-2--the-multichannel-multiplier-is-real-but-calls-are-a-bottleneck)
- [Rule 3 — Step count](#rule-3--fewer-steps-beats-more-steps-especially-email-only)
- [Rule 4 — List size](#rule-4--list-size-is-a-performance-multiplier)
- [Rule 5 — Conditional/behavioral logic](#rule-5--simulate-human-behavior-with-conditional-steps)
- [Rule 6 — Voice notes](#rule-6--voice-notes-selective-use-only)
- [Timing reference (defaults)](#timing-reference-defaults)

## Rule 1 — Always lead with LinkedIn if available

LinkedIn-first sequences achieve **5.7% global reply rate** vs **2.6%** for email-first
(2.2x difference). LinkedIn opens the relationship before the email arrives — the email
then lands as a follow-up from someone they've already seen, not a cold stranger.

→ If LinkedIn is available: **always start the sequence with a LinkedIn action**.

## Rule 2 — The multichannel multiplier is real, but calls are a bottleneck

| Channel mix | Global reply rate |
|---|---|
| Email only | 1.1% |
| LinkedIn + Email | 4.7% (4.3x email-only) |
| LinkedIn + Email + Call | 2.8% |

Counterintuitive finding: adding calls **lowers** the global reply rate. Why? Calls are
manual and time-intensive, so teams that add calls either send to far fewer contacts, or
abandon the follow-through. Calls are higher quality per touchpoint, but they create a
volume bottleneck that hurts the overall numbers.

→ Recommend calls **only when list size is small** (under 50 contacts) and the deal size
justifies the manual effort. Position calls as high-intent follow-ups, not openers.

## Rule 3 — Fewer steps beats more steps (especially email-only)

| Steps | Email only | LinkedIn + Email |
|---|---|---|
| 2 steps | 1.9% | 7.0% |
| 3 steps | 1.3% | **7.2% ← sweet spot** |
| 4 steps | 1.1% | 5.0% |
| 5+ steps | 0.7% | 3.4% |

For **email-only**: keep it to 2 steps max. Each additional step degrades performance
significantly. Less is more — better to improve the 2 steps than add a 3rd.

For **LinkedIn + Email**: **3 steps is the sweet spot** (7.2%). Performance drops
noticeably at 4 steps and sharply at 5+. Don't build long sequences — build better ones.

## Rule 4 — List size is a performance multiplier

| List size | Global reply rate |
|---|---|
| 6–50 leads | 5.3% |
| 51–200 leads | 3.2% |
| 201–500 leads | 2.3% |
| 501–1,000 leads | 1.9% |
| 1,000+ leads | 1.1% |

Smaller, more targeted lists dramatically outperform large blasts. This isn't just about
personalization — it reflects ICP sharpness, message relevance, and sender reputation.

→ If the user's list exceeds 200 contacts, **recommend splitting into tighter segments**
(by trigger, by sub-ICP, by company size) rather than sending one big campaign.

## Rule 5 — Simulate human behavior with conditional steps

The sequences that perform best mimic how a real human would follow up — not just a timer
firing. Build in these behavioral logic patterns wherever relevant:

- **LinkedIn profile visit before email**: signals that a human looked you up, increases open rate
- **Email right after an unanswered call**: natural follow-up ("just tried to reach you")
- **If LinkedIn invite not accepted after 7 days → switch to email**: don't wait forever
- **If LinkedIn invite accepted but no reply → send a message, not an email**: use the warm channel
- **Don't stack two emails back to back** if LinkedIn is available — use the channel switch as the pattern interrupt

## Rule 6 — Voice notes: selective use only

LinkedIn voice notes increase LinkedIn reply rate from **26.9% to 29.5%** (+10% relative
uplift). Worth using — but only for the right audience.

Use voice notes when: audience is under ~35, works in tech/startup, urban, informal
culture. Do NOT use voice notes when: audience is 40+, traditional industry (finance,
legal, manufacturing, pharma), corporate/enterprise, or any context where formality is
expected.

When in doubt, don't use them. A voice note that feels out of place damages the
relationship more than it helps.

## Timing reference (defaults)

Use these as defaults unless the context suggests otherwise:

| Gap | Recommended |
|---|---|
| LinkedIn action → First email | 1–2 days |
| Email → LinkedIn follow-up | 2–3 days |
| Email → Email follow-up | 3–5 days |
| After unanswered call → Email | Same day or next morning |
| LinkedIn invite timeout (no accept) | 7 days, then switch to email |
| Total sequence duration | 10–21 days max |

Keep sequences tight. The goal is to be memorable and relevant, not persistent and
annoying. A 3-week sequence that ends cleanly is better than a 6-week sequence that
trails off.
