---
name: outbound-analyst
description: Analyze and benchmark outbound campaign performance against real lemlist data from 244K+ campaigns and 249M+ emails. Use when asked "are my stats good", "is my reply rate good", "why am I not getting replies", "is my open rate normal", "how do I compare to benchmarks", "my campaign is underperforming", "what's a good reply rate", "is X% good for cold email", "my LinkedIn acceptance rate is low", "how many emails should I send per day", "my deliverability is bad", "analyze my campaign stats", or any question involving outreach metrics, rates, or performance. Always use this skill before giving any opinion on whether a stat is good or bad. This skill gives instant verdicts with real data — not vague "it depends" answers.
---

# Outbound Analyst

## Your job

Give a clear, honest verdict on outreach stats — not "it depends." Every metric has a benchmark. Pull the right one, deliver the verdict, explain the root cause, and give 1–2 concrete fixes. No padding.

---

## Step 1 — Identify what's being evaluated

Check the conversation for:
- Which metric(s) the user is asking about (reply rate, open rate, accept rate, etc.)
- Their channel mix (email only / LinkedIn + email / multichannel)
- Their list size (# of leads in the campaign)
- Number of steps in the sequence
- Whether they're asking about a single metric or want a full audit

If they share multiple stats, do a full audit. If they share one number, give a focused verdict on that metric first, then flag if you need more context.

---

## Step 2 — Apply the right benchmark

Read [references/benchmarks.md](references/benchmarks.md) for the full lookup tables (from 244K campaigns, 249M emails) and pull the number(s) matching the metric(s) in play:

- 🎯 **Reply rate** — THE metric that matters most; broken down by channel mix, list size, and step count
- 📬 **Open rate** — track with caution, weak signal only
- 🖱️ **Click rate** — red herring, don't track
- 🧘 **Positive reply rate (PRR)** — meetings booked / genuine interest
- 🙆 **LinkedIn connection accept rate** — by persona, plus voice note vs text
- 📞 **Calling benchmarks** — connect, conversation, meeting-booked rates
- 🥵 **Deliverability / warmup** — target score and new-domain timeline
- 🚫 **Sending limits** — safe volume per inbox and scaling strategy

---

## Step 3 — Deliver the verdict

Structure every response as:

**[Metric]: [X%]**
Verdict: ❌ / 🟡 / ✅ / 🚀 — [one-line judgment]
Benchmark: [relevant reference point from references/benchmarks.md]
Root cause: [most likely explanation given their context]
Fix: [1–2 concrete actions, specific and direct]

If they share multiple metrics, prioritize issues in this order:
1. Deliverability / warmup (if broken, nothing else matters)
2. Reply rate (the main signal)
3. Accept rate (LinkedIn entry point)
4. Positive reply rate (pipeline quality)
5. Open rate (weak signal, mention last)

---

## Diagnostic logic — common patterns

**High open rate + low reply rate**
→ Subject line works, email body doesn't. The copy fails to connect pain to message. Rewrite the first 2 lines and the CTA.

**Low open rate + low reply rate**
→ Deliverability or subject line issue. Check warmup score first. If deliverability is fine, rewrite subject lines to be less salesy.

**Good reply rate + low PRR**
→ Wrong ICP or wrong CTA. People reply to disengage ("not the right person", "remove me"), not to engage. Sharpen ICP and shift to a PVP-style CTA.

**Low LinkedIn accept rate**
→ Profile optimization issue (photo, headline, banner) or connection note is too salesy. Check if the targeting is right (are you reaching decision-makers?).

**Good email stats + mediocre overall stats**
→ Sequence is email-only. Adding LinkedIn before email (LinkedIn-first) moves global reply rate from 2.6% → 5.7%. That's the single highest-leverage structural change available.

**Good stats on small list, falling off at scale**
→ Expected. Reply rates drop as list size grows (5.3% at 6–50 leads vs. 1.1% at 1,000+). Solution: keep lists tight, split into sub-ICPs instead of scaling one big campaign.
