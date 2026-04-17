# 🗺️ Test Strategy Roadmap

---

## 1. 🔺 Test Pyramid

For a product like AutonomyAI the pyramid looks different from a typical SaaS app. The core value here is the AI-driven pipeline itself - the orchestration between the agent, VS Code Web, the preview server, and GitHub. That layer can't really be covered at a lower level, so I lean **heavier toward E2E** than I normally would.

```
          ▲   E2E           ~50%  - full lifecycle flows, VS Code Web, PR description & diff validation
         ▲▲▲  Integration   ~30%  - GitHub/Figma/Slack connections, API contract tests
        ▲▲▲▲▲ Unit          ~20%  - component tests, form validation, label/timestamp formatting
```

**Unit layer** is intentionally small here, and that's fine. There's not much isolated business logic to test. What actually makes sense:

- **Component tests** - not Storybook (that's the AI's change preview tool in this context, not a test framework). I'd open the live app and test components in isolation: task input with an empty prompt, over-limit text, special characters. Sidebar task list with pre-prepared data: a Draft task, a Sent to Devs task, a task created 14 minutes ago. The important thing is having **pre-seeded test data** ready - without it these checks don't mean much.
- **Task label and timestamp formatting** - "14 Minutes Ago", "5 Hours Ago", "Draft", "Sent to Devs" badges. If that logic lives in a pure utility function it's a straightforward unit test with mocked timestamps.

**Integration layer** is where external service connections belong, not AI pipeline internals. Real candidates:

- **GitHub project connection** - connect a repo, verify it shows up in the sidebar project list
- **Figma import** - attach a Figma URL to a task, verify the design reference is accepted and visible
- **Slack notifications** - trigger a task completion, verify the status update reaches the connected workspace
- **API contract tests** - task creation and status polling (`/tasks/:id?after_id=...`), dev server readiness endpoint (`/tasks/:id/storybook`). These run against mocked AI responses to stay fast and deterministic.

**E2E layer** is where most of the investment goes. The full fast-mode lifecycle - prompt, planning, code generation, preview, send to devs, PR - is the highest-risk flow in the product. I use a fixed golden-path prompt (`update project title font to Poppins...`) that produces minimal, predictable file changes, which keeps structural assertions stable despite non-deterministic AI output.

---

## 2. 🎯 What I Would Automate First

Priority is based on business value, manual testing cost, and regression risk:

**1. Full fast-mode task lifecycle** _(already exists in `studio.spec.ts`)_ - this is the core flow and the most expensive to run manually. It covers planning, code generation, preview iframe loading, and PR output. I'd extend it to also assert the internal PR Description and Files Changed tabs, not just the external GitHub link.

**2. Authentication flow** - login, session restoration from stored state, token expiry. Setup already exists in `auth.setup.ts`. I'd add negative cases: wrong credentials, expired session redirect, re-auth flow.

**3. Project connection and sidebar navigation** - connecting a GitHub project, switching between projects mid-session, task list filtering and sorting by status. Bug #3 (missing sidebar on User Settings and Manage Users pages) is a direct result of missing coverage here.

**4. Smart mode flow** - same lifecycle as fast mode, different agent behavior and longer timeouts. I'd keep it as a separate spec with its own timeout constants and plan structure assertions.

**5. PR output validation (internal view)** - the app has its own PR description and file diff view, separate from GitHub. I'd assert:

- PR title is non-empty
- "Summary" and "Key Changes" sections are present
- "Files Changed (N)" count is greater than 0
- File names match the expected set for the golden-path prompt (e.g. `root.tsx`, `tailwind.config.js`, `project-card.tsx`)
- The "View Pull Request" button resolves to a valid `github.com` URL

**6. Coding standards tab** - actively broken per Bugs #1 and #2, needs regression coverage as soon as fixes land.

---

## 3. ⚙️ CI/CD Structure

Right now there's one nightly workflow running the full suite. I'd split this into three tiers tied to branch strategy: feature branches -> `main`/`master` (staging) -> release branch (production).

### Test Tags

First thing I'd do is introduce a proper tagging system so each tier runs only what it needs:

- `@smoke` - golden-path fast mode lifecycle, already applied in the codebase
- `@regression` - full E2E suite including smart mode, PR view, diff validation
- `@component` - isolated UI component tests with pre-seeded data
- `@integration` - external service connections: GitHub, Figma, Slack
- `@quality` - LLM-as-a-judge scoring runs

This way `pw:smoke`, `pw:regression`, `pw:component` become independent scripts that can be composed per tier without duplicating workflow files.

### PR Checks (fast feedback, target ~5 min)

```yaml
trigger:  on pull_request -> main/master
branch:   feature branch
scope:
  - unit tests - always first, fastest feedback
  - @component tests - sidebar, buttons, dropdowns, task input states
  - @smoke E2E - block merge if the golden-path lifecycle is broken
report:   HTML artifact uploaded on failure
purpose:  catch regressions at the cheapest level before they hit staging
```

Component and unit tests run before E2E - if a button is broken there's no point waiting for E2E to tell you the same thing 5 minutes later.

### Nightly (full regression on staging)

```yaml
trigger:  cron 0 0 * * * against main/master (staging environment)
scope:
  - unit tests
  - @component tests (full coverage including edge cases with pre-seeded data)
  - @regression E2E - all flows, both modes, PR description & diff validation
  - @quality - LLM-as-a-judge scoring (nightly only, too slow for PR checks)
report:   HTML artifact uploaded to GitHub Actions, retained 7 days
notify:   Slack notification on failure
purpose:  full confidence check on staging before any release
```

### Release Gate (before production deploy)

```yaml
trigger:  push to release branch (or manual dispatch)
branch:   release - no new features, only critical fixes
scope:
  - unit + @component + @regression (same as nightly)
  - @integration - GitHub connect, Figma import, Slack notifications
  - version increment checks + PR link validation
gate:     all green + manual approval before deploy proceeds
purpose:  hard stop before shipping a broken pipeline to production
```

`@integration` tests are intentionally kept out of PR checks and nightly. Third-party availability and rate limits make them unreliable as a daily gate - their failures should block a production deploy decision, not a developer's PR.

### Test Data Management

This is something that will bite hard if ignored. Every E2E run creates real tasks, projects, and generated artifacts. Over time the test environment fills up and assertions start behaving unpredictably - a task list with 300+ entries is a different beast than one with 5.

My approach:

- Keep a **minimal snapshot of the test database** - a known baseline with exactly what each suite needs and nothing more
- **Restore the snapshot on a schedule** (weekly, or before each nightly run) rather than writing cleanup logic per test - that stuff is brittle and breaks silently
- The snapshot should cover: one connected GitHub project, one Draft task, one Sent to Devs task, one completed task with a PR
- For the `@quality` suite - also include a completed task with known plan and PR content to use as a scoring baseline

---

## 4. 🤖 Challenges with Non-Deterministic AI Outputs

This is where testing an AI product gets genuinely interesting and tricky.

### The core problem

The primary output - generated plan, code changes, PR description, file diff - is different every single run. Classic `expect(text).toBe(...)` assertions fall apart immediately. I need a different approach.

### How I handle it

**Assert structure, not content.** I don't care what the plan _says_ - I care that it _exists_ with the right structure. For example:

- `expectPlanProseBlockVisible()` - plan rendered ✓
- `expectTaskSpecCardContainsText('Task Spec Doc')` - spec doc tab present ✓
- PR description contains "Summary" and "Key Changes" headings ✓
- Files Changed tab shows count > 0 ✓

For the Task Spec Doc (the plan tab), I'd assert section headings like "What We're Building", "Architecture Overview", "Key Decisions" - these are structural outputs the AI is always prompted to produce, so they're stable enough to rely on.

**Assert outcomes, not outputs.** Instead of validating what was generated, I check that something meaningful actually happened:

- Preview iframe visible after code generation (VS Code Web server is up)
- Version number incremented (V01 -> V02 after Send to Devs)
- PR link resolves to a valid GitHub URL
- Files Changed count > 0

**VS Code Web validation.** The internal IDE is a VS Code for the Web instance spun up per task. Currently `waitForStorybookResponse()` only gates on the dev server being ready - I'd add a parallel assertion that the VS Code iframe is visible and the file explorer is populated. That confirms the workspace was actually set up, not just that the Storybook server started.

**Files Changed tab - deterministic assertions for a fixed prompt.** With the golden-path Poppins font prompt, the changed files are predictable: `root.tsx`, `tailwind.config.js`, `project-card.tsx`, `.storybook/preview-head.html`. I'd assert:

- These specific filenames appear in the diff view
- File count matches the expected number (6 for this prompt)
- At least one file shows additions

This is one of the few places where I can be strict, because the prompt scope is intentionally narrow.

**API-level phase gating.** The `waitForGenerationResponse()` pattern already in the codebase is the right call. Polling until the pipeline reports a known state transition (`step + status`) rather than timing UI assertions decouples test stability from how fast the AI happens to run that day.

**Tiered timeouts as performance monitoring.** The existing constants (`FIVE_MINUTES`, `SEVEN_MINUTES`, `TWELVE_MINUTES`) set the maximum acceptable time per phase. I'd log actual elapsed time as a metric and alert (without failing) when a phase exceeds its p95 baseline. That turns slow flaky tests into a performance signal - directly relevant to Bug #4 where fast mode takes 15-20 minutes.

### LLM-as-a-judge quality validation

Structural assertions tell me the pipeline ran. They don't tell me whether what it produced was actually useful. For that I'd add a separate `@quality` suite that collects the full output of a run and sends it to a judge LLM for scoring.

**What I collect per run:**

```
prompt         -> fixed golden-path prompt (known)
plan           -> scraped from .prose.prose-invert.prose-sm, or pulled from task API response body
pr_summary     -> scraped from PR Description tab
files_changed  -> list of filenames + line diff counts from Files Changed tab
```

**Evaluation prompt sent to the judge (GPT-4o or Claude):**

```
Given this user prompt: "{prompt}"
The AI generated this plan: "{plan}"
Produced these file changes: "{files_changed}"
With this PR summary: "{pr_summary}"

Score on a 1-5 scale:
1. Relevance    - do the changes match the prompt intent?
2. Scope        - are changes minimal and focused, or did the AI touch unrelated files?
3. Consistency  - does the plan match what was actually implemented?
4. Correctness  - are the file paths and code changes plausible?

Return JSON: { "relevance": N, "scope": N, "consistency": N, "correctness": N, "reasoning": "..." }
```

**How it fits into CI:**

- Nightly only - too slow and costly for PR checks
- Scores logged as soft assertions - the test doesn't hard-fail on a bad score, but it shows up in the report
- A threshold like `relevance < 3` does trigger a hard failure to catch severe regressions
- Scores aggregate across nightly runs as a quality trend - this is how you catch model degradation before users do

The plan content and PR summary are likely available in the task API response body too - I'd prefer pulling them from the network layer via `waitForResponse()` interception rather than DOM scraping. More reliable and doesn't depend on the UI rendering correctly.

---
