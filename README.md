<p align="center">
  <h1 align="center">AI Engineer Study Guide</h1>
  <p align="center">
    A structured, self-directed curriculum for becoming a production-grade AI engineer.<br>
    From prompt engineering to agentic systems to ethical deployment — everything you need, nothing you don't.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Modules-14-blue?style=flat-square" alt="Modules">
  <img src="https://img.shields.io/badge/Topics-60%2B-blue?style=flat-square" alt="Topics">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Last%20Updated-Sept%202026-orange?style=flat-square" alt="Last Updated">
</p>

<p align="center">
  <a href="./study-app/index.html"><strong>Interactive Study App</strong></a> ·
  <a href="#visual-roadmap"><strong>Visual Roadmap</strong></a> ·
  <a href="#quick-start"><strong>Start Learning</strong></a> ·
  <a href="./CONTRIBUTING.md"><strong>Contributing</strong></a>
</p>

---

> **92% of developers now use AI coding tools** (GitHub, 2026). The tooling is everywhere. What separates a developer who *uses* AI from an engineer who *builds with* AI is depth — retrieval architecture, agent design, model operations, production trust. This guide covers that depth.

---

## Why This Exists

This is **not** an awesome-list. There are no 400 links to skim and forget.

This is **not** an online course. There are no video lectures or paywalls.

This is **not** theory-only. Every module connects to production decisions real teams face.

This is a **study guide** — opinionated, structured, and deep. It covers the 14 modules an AI engineer needs to own, organized into a clear progression from fundamentals to specializations. Each topic includes written notes designed to be understood well enough to explain under pressure.

---

## Who This Is For

| Background | Recommended Entry Point | Focus Areas |
|---|---|---|
| **Software engineer adding AI skills** | Phase 1 -- start from the beginning | Prompt engineering, RAG, tool use |
| **ML engineer moving to applied AI** | Phase 2 -- core AI engineering | Agent design, MCP, model operations |
| **Backend engineer building AI features** | Phase 1, Module 02 -- backend fundamentals | Systems integration, LLMOps, infra |
| **Tech lead / architect** | Phase 3 -- advanced patterns | Security, agentic coordination, trust |
| **Career switcher** | Phase 1, Module 01 -- prompt engineering | Full curriculum, linear progression |

---

## Visual Roadmap

```mermaid
graph TB
    subgraph Phase1["Phase 1: Foundations"]
        M01["01 Prompt Engineering"]
        M02["02 Backend Fundamentals"]
    end

    subgraph Phase2["Phase 2: Core AI Engineering"]
        M03["03 RAG"]
        M04["04 Tool Use & MCP"]
        M05["05 Model Operations"]
    end

    subgraph Phase3["Phase 3: Advanced Patterns"]
        M06["06 Agentic Systems"]
        M07["07 Agent Frameworks"]
        M08["08 Security & Trust"]
    end

    subgraph Phase4["Phase 4: Production & Scale"]
        M09["09 LLMOps"]
        M10["10 Systems & Infra"]
        M11["11 Engineering Practice"]
    end

    subgraph Phase5["Phase 5: Specializations"]
        M12["12 Multi-Modal AI"]
        M13["13 Decision Models"]
        M14["14 Ethical AI"]
    end

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
    Phase4 --> Phase5

    M01 --> M03
    M02 --> M04
    M03 --> M06
    M04 --> M06
    M05 --> M09
    M06 --> M07
    M07 --> M09
    M08 --> M09
    M09 --> M10
    M10 --> M11
    M11 --> M12
    M11 --> M13
    M11 --> M14
```

---

## Curriculum

### Phase 1: Foundations (~2 weeks)

| # | Module | Topics | Est. Time | Status |
|---|--------|--------|-----------|--------|
| 01 | [Prompt Engineering](./modules/01-prompt-engineering/) | 5 | ~8h | [ ] Coming soon |
| 02 | [Backend Fundamentals](./modules/02-backend-fundamentals/) | 4 | ~6h | [ ] Coming soon |

### Phase 2: Core AI Engineering (~4 weeks)

| # | Module | Topics | Est. Time | Status |
|---|--------|--------|-----------|--------|
| 03 | [RAG](./modules/03-rag/) | 6 | ~12h | [x] Notes complete |
| 04 | [Tool Use & MCP](./modules/04-tool-use-mcp/) | 4 | ~8h | [ ] Coming soon |
| 05 | [Model Operations](./modules/05-model-operations/) | 5 | ~10h | [ ] Coming soon |

### Phase 3: Advanced Patterns (~3 weeks)

| # | Module | Topics | Est. Time | Status |
|---|--------|--------|-----------|--------|
| 06 | [Agentic Systems](./modules/06-agentic-systems/) | 6 | ~10h | [ ] Coming soon |
| 07 | [Agent Frameworks](./modules/07-agent-frameworks/) | 6 | ~8h | [ ] Coming soon |
| 08 | [Security & Trust](./modules/08-security-trust/) | 5 | ~8h | [ ] Coming soon |

### Phase 4: Production & Scale (~3 weeks)

| # | Module | Topics | Est. Time | Status |
|---|--------|--------|-----------|--------|
| 09 | [LLMOps](./modules/09-llmops/) | 6 | ~10h | [ ] Coming soon |
| 10 | [Systems & Infra](./modules/10-systems-infra/) | 5 | ~8h | [ ] Coming soon |
| 11 | [Engineering Practice](./modules/11-engineering-practice/) | 4 | ~6h | [ ] Coming soon |

### Phase 5: Specializations (~2 weeks each)

| # | Module | Topics | Est. Time | Status |
|---|--------|--------|-----------|--------|
| 12 | [Multi-Modal AI](./modules/12-multimodal-ai/) | 5 | ~8h | [ ] Coming soon |
| 13 | [Decision Models](./modules/13-decision-models/) | 5 | ~8h | [ ] Coming soon |
| 14 | [Ethical AI](./modules/14-ethical-ai/) | 5 | ~6h | [ ] Coming soon |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/ai-engineer.git
cd ai-engineer

# Browse the syllabus
cat syllabus.md

# Open the interactive study app
open study-app/index.html
```

Start with the [syllabus](./syllabus.md) for a full topic list, or jump into the [RAG module](./modules/03-rag/) — it is the most complete section with six written topics, a cheat sheet, interview questions, and a runnable project.

---

## Project Structure

```
ai-engineer/
├── README.md                          # This file
├── ROADMAP.md                         # Visual learning path with Mermaid diagrams
├── syllabus.md                        # Master topic list (66 topics, 14 modules)
├── CONTRIBUTING.md                    # How to contribute
│
├── modules/                           # All 14 modules
│   ├── 01-prompt-engineering/         # Phase 1
│   ├── 02-backend-fundamentals/
│   ├── 03-rag/                        # Phase 2 (complete: notes + cheatsheet + interview + project)
│   ├── 04-tool-use-mcp/
│   ├── ...
│   └── 14-ethical-ai/                 # Phase 5
│
├── study-app/                         # Interactive flashcard study app
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│
├── trending/                          # Fast-moving AI landscape topics
├── resources/                         # Curated books, courses, papers, tools
└── _templates/                        # Templates for contributing content
```

---

## How to Contribute

Contributions are welcome. Whether it is fixing a factual error, adding depth to an existing topic, or writing notes for a new module — all of it helps.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on structure, style, and pull request expectations.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  Built for engineers who want to understand AI deeply, not just use it superficially.
</p>
