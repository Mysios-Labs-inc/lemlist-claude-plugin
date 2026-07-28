# Prompt Optimization Techniques — Lookup Catalog

Reference catalog for Phase 3 of the prompt-engineering skill. Each entry states what the
technique is, **when to apply it**, and **how** to apply it (with copy-ready snippets).

Select and apply only the techniques that improve the specific prompt being optimized.
Don't add complexity for its own sake — every addition must earn its place.

## Table of Contents

| # | Technique | Apply when |
|---|---|---|
| 1 | [Clarity & Directness](#technique-1--clarity--directness) | The task is ambiguous or the output is unpredictable |
| 2 | [Role Prompting](#technique-2--role-prompting) | The output requires expertise, a specific voice, or a defined perspective |
| 3 | [XML Structuring](#technique-3--xml-structuring) | The prompt contains multiple sections, long context, or variable inputs |
| 4 | [Few-Shot Examples](#technique-4--few-shot-examples) | The output format is specific, the tone matters, or the task stays ambiguous |
| 5 | [Chain of Thought](#technique-5--chain-of-thought) | The task involves reasoning, analysis, classification, or judgment calls |
| 6 | [Output Specification](#technique-6--output-specification) | Always — output specification is almost always missing |
| 7 | [Explicit Constraints](#technique-7--explicit-constraints) | There are important boundaries, accuracy requirements, or tone rules |
| 8 | [Prompt Prefilling (API)](#technique-8--prompt-prefilling-for-api-use) | Building API integrations that need JSON output or specific formatting |
| 9 | [Task Decomposition](#technique-9--task-decomposition) | The prompt tries to do multiple things at once |
| 10 | [Agent / Agentic Prompt Patterns](#technique-10--agent--agentic-prompt-patterns) | Building n8n workflows, API agents, or multi-step automations |

---

## Technique 1 — Clarity & Directness

Claude responds well to clear, explicit instructions. Being specific about desired
output enhances results. If you want "above and beyond" behavior, explicitly request
it — don't rely on inference.

**Apply when:** the task is ambiguous or the output is unpredictable.
**How:** replace vague verbs ("help me", "analyze", "improve") with specific actions
("extract the 3 main objections", "rewrite in under 100 words", "classify as X or Y").

---

## Technique 2 — Role Prompting

Give Claude a specific identity with relevant expertise. Claude matches the tone
and style of the prompt — a precise role creates a precise output.

**Apply when:** the output requires expertise, a specific voice, or a defined perspective.
**How:**
```
You are an expert [role] with deep experience in [domain].
Your job is to [specific task].
```
Avoid generic roles ("helpful assistant") — be specific ("senior B2B copywriter
specialized in cold outreach for SaaS companies").

---

## Technique 3 — XML Structuring

Claude was trained with XML tags in its training data. Using XML tags like
`<example>`, `<document>`, `<instructions>` to structure prompts helps guide
Claude's output, especially for complex multi-part inputs.

**Apply when:** the prompt contains multiple sections, long context, or variable inputs.
**How:**
```xml
<context>
[background information]
</context>

<task>
[what Claude must do]
</task>

<constraints>
[rules and boundaries]
</constraints>

<output_format>
[exact structure expected]
</output_format>
```

---

## Technique 4 — Few-Shot Examples

Show Claude exactly what a good output looks like. Examples aren't always
necessary, but they shine when explaining concepts or demonstrating specific formats —
they show rather than tell, clarifying subtle requirements that are difficult to
express through description alone.

**Apply when:** the output format is specific, the tone matters, or the task is
ambiguous despite good instructions.
**How:**
```xml
<example>
Input: [sample input]
Output: [ideal output]
</example>
```
For Claude 4.x: ensure examples align perfectly with desired behavior —
Claude pays very close attention to example patterns and will replicate them exactly.

---

## Technique 5 — Chain of Thought

Ask Claude to reason step-by-step before producing the final output.
This dramatically improves accuracy on complex, multi-step, or analytical tasks.

**Apply when:** the task involves reasoning, analysis, classification, or judgment calls.
**How:**
```
Before answering, think through this step by step:
1. [first reasoning step]
2. [second reasoning step]
3. Then produce the output.
```
Or use extended thinking for the most complex tasks (add to API call):
`"thinking": {"type": "enabled", "budget_tokens": 5000}`

---

## Technique 6 — Output Specification

Define the exact format, length, and structure of the output.
Instead of saying "be concise", give a specific range like "Limit your response
to 2–3 sentences". This gives Claude clearer guidance.

**Apply when:** always — output specification is almost always missing.
**How:**
```
Output format:
- Structure: [bullet list / JSON / markdown table / prose paragraphs]
- Length: [exact word count or sentence count]
- Sections: [list each section with its heading]
- Language: [formal / casual / technical / plain]
```

---

## Technique 7 — Explicit Constraints

State what Claude should NOT do as positive rules where possible.
Negative framing ("don't do X") can backfire — Claude focuses on the forbidden behavior.

**Apply when:** there are important boundaries, accuracy requirements, or tone rules.
**How:** convert negatives to positives:
- ❌ "Don't be verbose" → ✅ "Use 50 words maximum"
- ❌ "Don't make up data" → ✅ "Only use information explicitly provided in the input"
- ❌ "Don't be formal" → ✅ "Write in a casual, conversational tone"

---

## Technique 8 — Prompt Prefilling (for API use)

Pre-fill the assistant turn to force a specific output format or starting point.

**Apply when:** building API integrations that need JSON output or specific formatting.
**How:**
```json
{
  "role": "assistant",
  "content": "{"
}
```
Claude will continue from the prefill — use with a stop sequence for clean JSON extraction.

---

## Technique 9 — Task Decomposition

Build modular prompts that do one thing and only one thing. This makes them
easier to test and actually makes prompts perform better.

**Apply when:** the prompt tries to do multiple things at once.
**How:** split into separate prompts, each with a single clear task.
For agents: use prompt chaining — output of prompt 1 becomes input of prompt 2.

---

## Technique 10 — Agent / Agentic Prompt Patterns

For Claude operating autonomously with tools or in loops.

**Apply when:** building n8n workflows, API agents, or multi-step automations.

Key rules for agentic prompts:
- Define the task, the available tools, and the termination condition explicitly
- Add explicit checkpoints: "Before taking any action, confirm X"
- Specify error handling: "If [condition], do [fallback], not [risky action]"
- Define output schema precisely — agents must return structured data
- Add a "when to stop" instruction — prevent infinite loops
- For sensitive actions: add a confirmation step before executing

```xml
<role>
You are an autonomous [role]. You have access to [tools].
</role>

<task>
[Specific task with clear start and end conditions]
</task>

<process>
1. [Step 1]
2. [Step 2]
3. When [condition], stop and return the result.
</process>

<output_schema>
Return a JSON object with:
- field1: [description]
- field2: [description]
</output_schema>

<constraints>
- Never [critical restriction]
- If [error condition]: [fallback behavior]
- Stop when: [termination condition]
</constraints>
```
