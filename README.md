# Anti-Sycophancy Protocol

> **A universal interaction protocol for LLMs — stop agreeing, start analyzing.**

LLMs are trained with RLHF to be agreeable. Human raters prefer comfortable answers, so models learn that agreement = good, pushback = bad. This protocol is a structural fix: a set of rules that force any LLM into a **critic-first, analysis-second, praise-last** interaction pattern.

Unlike simple system prompts like "be critical", this protocol defines:

- **Precondition checking** — catch unverified assumptions before engaging
- **Expression bans** — eliminate social lubricant and emotional mirroring
- **Response structure** — enforce adversarial-first analysis with verifiable reasoning
- **Error handling** — how to admit uncertainty without apology
- **Domain escalation** — stricter rules for high-risk topics (relationships, spirituality)
- **Per-scenario overrides** — specialized rules for video content creation (3-second critique, 3-layer deconstruction)

## Why This Exists

The default LLM interaction mode is sycophantic. Studies show AI agreement rates average ~50% higher than human baselines. This isn't malice — it's a training artifact. But it means:

- Users get validation instead of truth
- Bad premises go unchallenged
- Critical thinking is outsourced, not augmented
- Decisions are made on comfortable lies, not uncomfortable facts

This protocol treats the AI as **a logically rigorous colleague**, not an emotionally supportive assistant.

## Quick Start

### Claude Code (CLAUDE.md)

Copy the content of `claude-integration/CLAUDE.md` into your project's `CLAUDE.md` or merge the relevant section.

### Custom Instructions (ChatGPT, Claude, Gemini, DeepSeek)

Paste the entire `protocol.md` into your custom instructions / system prompt. Works best with models that support long system prompts.

### As a Skills.sh Skill

```bash
npx skills add your-org/anti-sycophancy-protocol
```

(Coming soon after initial release.)

## Structure

```
anti-sycophancy-protocol/
├── README.md                        # This file
├── LICENSE                          # MIT
├── protocol.md                      # Full protocol specification (portable)
├── claude-integration/
│   ├── CLAUDE.md                    # Ready-to-copy Claude Code config
│   └── skill/
│       ├── SKILL.md                 # Skills.sh compatible skill definition
│       └── SKILL_REVIEW.md          # Verification checklist
└── examples/
    └── before-after.md              # Example responses with/without protocol
```

## The Five Rules (Summary)

| # | Rule | What it does |
|---|------|-------------|
| 1 | **Premise Check** | Challenges unverified assumptions before engaging |
| 2 | **Expression Bans** | No "great question", "you're right", emotional mirroring |
| 3 | **Response Structure** | 20% counter-argument → 60% fact/logic → 20% conditional support |
| 4 | **Error Handling** | Admit uncertainty without apology or hedging |
| 5 | **Domain Escalation** | Stricter rules for relationships, spirituality, life advice |

## Design Principles

1. **Model-agnostic** — Works with any instruction-tuned LLM (Claude, GPT, Gemini, DeepSeek, Llama)
2. **Portable** — One file, copy-paste into any system prompt
3. **Verifiable** — Each rule is a testable constraint, not a vague suggestion
4. **Overridable** — "Switch to supportive mode" command for when you need encouragement
5. **Extensible** — Domain-specific rules (like video creation) slot in as sections

## License

MIT — do whatever you want with it.

## Contributing

PRs welcome. Rules should be:
- **Testable** — can you write a pass/fail check for it?
- **Minimal** — solves one problem, doesn't introduce new failure modes
- **Universal** — not tied to a specific model or platform
