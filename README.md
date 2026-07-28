# lemlist Claude Code skills

A collection of GTM, outbound, and revenue-ops [skills](https://docs.claude.com/en/docs/claude-code/skills) for [Claude Code](https://claude.com/claude-code) — covering ICP definition, list building, copywriting, campaign design, CRM hygiene, and more.

## Install

### As a Claude Code plugin (recommended)

```
/plugin marketplace add Mysios-Labs-inc/lemlist-claude-plugin
/plugin install lemlist-skills@lemlist-skills
```

All 38 skills become invokable immediately — no `npx`, no copying files into `~/.claude/skills`, and `/plugin update` pulls new skills as they're added. The plugin also wires up the [lemlist MCP server](https://developer.lemlist.com/mcp/setup) (`https://app.lemlist.com/mcp`), so skills can call lemlist's campaign, lead, and analytics data directly instead of going through the API by hand.

### Via npx (no plugin support needed)

You need [Node.js](https://nodejs.org) 18+ and Claude Code installed. No npm publish required — the installer is shipped straight from GitHub via `npx`.

### Interactive picker (recommended)

```sh
npx github:Mysios-Labs-inc/lemlist-claude-plugin
```

You'll get an arrow-key checklist. Keys:

| Key                | Action                                  |
| ------------------ | --------------------------------------- |
| `↑` `↓` or `j` `k` | Move cursor                             |
| `space`            | Toggle the highlighted skill            |
| `a`                | Toggle all (in current filter)          |
| `/`                | Filter — type to search, `esc` to clear |
| `enter`            | Install selected skills                 |
| `q` or `esc`       | Cancel                                  |

### Install specific skills by name

```sh
npx github:Mysios-Labs-inc/lemlist-claude-plugin icp-definer copywriting-first-touch outbound-analyst
```

### Install everything

```sh
npx github:Mysios-Labs-inc/lemlist-claude-plugin --all
```

## Where they go

By default, skills install to your user-global directory:

```
~/.claude/skills/<skill-name>/SKILL.md
~/.claude/skills/<skill-name>/references/   (where present)
~/.claude/skills/<skill-name>/scripts/      (where present)
~/.claude/skills/<skill-name>/assets/       (where present)
```

The installer copies each skill folder recursively, so any bundled `references/`, `scripts/`, or `assets/` come along automatically — no extra steps. Restart Claude Code (or start a new session) and the skills become invokable — Claude will discover them automatically based on each skill's `description` field.

### Project-local install

Add `--project` to install into the current repo instead, scoping the skills to that project only:

```sh
npx github:Mysios-Labs-inc/lemlist-claude-plugin --project icp-definer
# installs to ./.claude/skills/icp-definer/
```

## Options

| Flag         | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `--all`      | Install every skill                                                |
| `--list`     | Print all available skill names (one per line)                     |
| `--project`  | Install into `./.claude/skills` instead of `~/.claude/skills`      |
| `--force`    | Overwrite skills that are already installed                        |
| `--help`     | Show usage                                                         |

Existing skills are skipped by default — re-running the installer is safe. Use `--force` when you want to pull updates.

## Uninstall

Each skill is a self-contained folder. Remove the ones you don't want:

```sh
rm -rf ~/.claude/skills/icp-definer
```

## Skill structure

Every skill is a self-contained folder with a required `SKILL.md`. A handful of the larger
skills also bundle:

- `references/` — lookup material Claude loads only when needed (e.g. per-platform integration
  guides in `n8n-workflow-builder`, benchmark tables in `outbound-analyst`, the objection
  reference in `cold-call-script`)
- `scripts/` — runnable code for deterministic steps (e.g. the scraping scripts in
  `website-scraper`, the deck generator in `slide-deck-builder`)
- `assets/` — output templates (e.g. the report template in `persona-insights-analysis`)

`SKILL.md` stays lean and points to these files by name when they're relevant, so a skill only
pulls in the extra context it actually needs for the task at hand.

## Available skills

**Strategy & research**
- **icp-definer** — Define and prioritize narrow Ideal Customer Profiles (ICPs) for outbound targeting.
- **persona-definer** — Identify and prioritize buyer personas at the contact level for outbound targeting.
- **deep-company-analyser** — Deep-dive customer intelligence from website, case studies, and reviews to extract pain points, buying triggers, and customer language.
- **competitor-finder** — Identify direct and indirect competitors, map positioning, and generate differentiation angles for outbound.
- **market-research-edp** — SaaS market research for identifying Existential Data Points (EDPs) — the metrics that turn a solution from nice-to-have to must-have.
- **niche-data-finder** — Discover 3–5 high-quality B2B data sources with strong buying-intent signals for a specific industry or target market.
- **pain-identifier** — Identify and prioritize evidence-based pain points a target company likely faces, based on growth signals, tech stack, and hiring activity.
- **trigger-finder** — Buying-trigger analysis for outbound — identifies and interprets events (funding, hiring, tool changes) to time outreach and sharpen messaging.
- **value-prop-lister** — Extract and organize all value props from a company website into a structured inventory, mapped to personas and channels.
- **offer-definer** — Transform product descriptions and feature lists into compelling, outcome-focused offers for cold outreach.
- **gtm-action-thinker** — Brainstorms, challenges, and pushes any GTM idea to its fullest potential — both the idea itself and its execution.

**List building**
- **list-builder** — Translate an ICP into concrete lemlist search filters and signal configurations.
- **company-finder** — Step-by-step guide for identifying target companies in lemlist using signals, triggers, and firmographic filters.
- **people-finder** — Step-by-step guide for configuring lemlist's people database search to find the right contacts.

**Campaign design**
- **outbound-campaign-architect** — Design high-performance outbound sequences based on ICP, channels, and empirical lemlist data from hundreds of thousands of campaigns.
- **campaign-angle-finder** — Generate 3 distinct campaign angles for a given persona and context.
- **cta-designer** — Design personalized, value-based CTAs that spark conversations instead of demanding meetings.

**Copywriting**
- **copywriting-first-touch** — Write a high-converting first-touch cold email, standalone or as the opener of a sequence.
- **copywriting-follow-up** — Write follow-up emails after no reply, introducing a new angle each time.
- **copywriting-ic-sequence** — 3-email outbound sequence targeting Individual Contributors (SDR, AE, BDR, etc.).
- **copywriting-manager-sequence** — 3-email outbound sequence targeting Manager-level buyers.
- **copywriting-vp-sequence** — 3-email outbound sequence targeting VP-level buyers.
- **copywriting-analyzer** — Score, audit, and rewrite B2B cold emails against research-backed criteria targeting 8.5%+ reply rates.
- **copywriting-refiner** — Audit and tighten any cold email, LinkedIn message, or sequence against a strict quality checklist.
- **linkedin-outbound-angle** — Analyze a LinkedIn profile and identify the perfect outbound attack angle.
- **linkedin-sequence** — Write a 2-message LinkedIn DM sequence sent after a connection request is accepted.
- **cold-call-script** — Generate a structured cold call script from a target description.

**Analytics & ops**
- **outbound-analyst** — Benchmark campaign performance against real lemlist data from 244K+ campaigns and 249M+ emails.
- **pipeline-analysis** — Run a full sales pipeline analysis and render an interactive visual dashboard.
- **reply-handler** — Analyze cold outreach replies and craft the right response based on a relationship-first philosophy.
- **crm-duplicate-detector** — Detect, score, and resolve duplicate contacts and company accounts in CRM systems.
- **persona-insights-analysis** — Analyze sales call transcripts to produce deep, structured persona intelligence reports.
- **claap-sales-opportunity-detector** — Scan Claap call transcripts to surface expansion and upsell opportunities.

**Automation & utilities**
- **n8n-workflow-builder** — Build production-ready n8n workflows as directly importable JSON.
- **n8n-debugger** — Debug n8n workflow errors from error messages, screenshots, or both.
- **prompt-engineering** — Transform any rough or vague prompt into a production-ready, optimized prompt for Claude.
- **slide-deck-builder** — Build polished `.pptx` slide decks from a source document (PDF, Word, text).
- **website-scraper** — Scrape structured data from any website and export it to a clean CSV.

## License

MIT
