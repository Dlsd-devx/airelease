# Engineering Manager Hack Day: AI-Driven Development Workflows
**Date:** January 16, 2026  
**Time:** 09:00 - 15:00  

## Objectives
- Master the lifecycle of AI-assisted software development.
- Establish standardized practices for team-wide prompt engineering.
- Create actionable artifacts (PRDs, Rule Files, Commands) to take back to teams.

---

## Agenda

### 09:00 - 09:30 | Welcome & Kickoff
- **Focus:** Introduction to the "Junior Engineer" mindset.
- **Activity:** Environment setup and goal setting for the day.

### 09:30 - 10:30 | Session 1: PRD First Development
**"The North Star"**
- **Concept:** Before writing any code, create a Product Requirement Document (PRD) in Markdown.
- **Why it matters:** Instead of prompting for individual features piecemeal, we feed the agent the entire scope (Target Users, Mission, Architecture) upfront so it understands the full context of what it is building.
- **Goal:** Draft a PRD for a sample module.

### 10:30 - 11:15 | Session 2: Modular Rules Architecture
**Context Window Management**
- **Concept:** Don't dump everything into a massive global system prompt. Keep global rules lightweight (under ~200 lines). Create separate "reference" markdown files (e.g., `api-rules.md`, `frontend-rules.md`).
- **Why it matters:** Protects the agent's context window and ensures high-quality, relevant outputs by only loading necessary rules.
- **Goal:** Define a folder structure for team-specific rules.

### 11:15 - 11:30 | Coffee Break

### 11:30 - 12:15 | Session 3: Commandify Everything
**Standardization at Scale**
- **Concept:** If you prompt something more than twice, turn it into a reusable "Slash Command" or workflow file.
- **Why it matters:** Replaces repetitive typing ("Please analyze this code...") with standardized templates for tests, git commits, or PR reviews.
- **Goal:** Create 3 core commands for the team (e.g., `/test`, `/refactor`, `/document`).

### 12:15 - 13:00 | Lunch Break

### 13:00 - 13:45 | Session 4: The Context Reset
**Planning vs. Execution**
- **Concept:** Always restart the chat session between the Planning Phase and the Execution Phase.
- **Why it matters:** Wiping memory after creating an "Execution Plan" clears out brainstorming "noise," preventing hallucinations and confusion during the coding phase.
- **Goal:** Practice the "Plan -> Reset -> Execute" workflow on a small feature.

### 13:45 - 14:30 | Session 5: System Evolution (The "Bug Loop")
**Continuous Improvement**
- **Concept:** Treat every bug as a failure of the System, not just the code.
- **Why it matters:** When a bug occurs, ask: "What rule was missing?" Updating `rules.md` or command templates ensures the agent never makes the same mistake again, making the "System" smarter over time.
- **Goal:** Analyze a recent bug and draft a rule Update to prevent recurrence.

### 14:30 - 15:00 | Wrap-up & Next Steps
- Review created artifacts.
- Define rollout strategy for teams.
