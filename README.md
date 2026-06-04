# 🧪 Prompt Engineering Lab — Enterprise Studio V2

> **A zero-dependency, production-grade AI prompt engineering learning platform.**  
> Master system directives, few-shot exemplars, chain-of-thought reasoning, metaprompting, jailbreak defense, and more — all from your browser.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00d4ff?style=for-the-badge&logo=github)](https://aberaberhe787-cloud.github.io/prompt-engineering-lab/)
![Version](https://img.shields.io/badge/Version-2.0-blueviolet?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=for-the-badge)

---

## ✨ Features

### 🎨 Design Studio (Prompt Playground)
- **System Prompt Editor** with real-time token counting and sub-word BPE visualization
- **Few-Shot Exemplar Builder** — add/remove user↔assistant example pairs
- **Temperature & Max Tokens** parameter sliders
- **Simulated LLM Engine** with heuristic keyword matching and Chain-of-Thought streaming
- **Prompt Auditor Dashboard** — real-time quality scoring with strengths/improvements analysis
- **Compiled Token Stream Viewer** — inspect the fully-assembled prompt structure

### ⚡ Metaprompt Generator
- Select from predefined task archetypes (Summarization, Classification, Q&A, Creative Writing, Code Review, Extraction)
- Auto-generates professional system prompts with constraints, guardrails, and output format specifications
- One-click load into the Design Studio

### 🏟️ A/B Comparison Arena
- Side-by-side prompt comparison testing
- Independent audit scoring for both variants
- Visual diff highlights showing which prompt performs better
- Structured decision support for prompt iteration

### 🛡️ Red-Team Security Lab
- **4 automated attack vectors**: Role Confusion, Prompt Leaking, Delimiter Injection, Emotional Manipulation
- Real-time defense strength assessment
- Security score with detailed vulnerability analysis
- Train yourself to write bulletproof system prompts

### 📚 Academy Syllabus
- **5 structured lessons**: Role Prompting, Delimiters, Structured Outputs, Few-Shot Learning, Chain-of-Thought
- Each lesson includes objectives, techniques, templates, and comparison examples
- One-click template loading into the playground

### 🏆 Gamified Quests
- **4 challenge levels**: JSON Purist, Constrained Summary, Logic Solver, Jailbreak Guardian
- Client-side automated validation with regex and heuristic checks
- Badge rewards and completion tracking
- **Certificate of Completion** unlocks when all quests are completed

### 🔑 Live API Integration
- Connect to **Google Gemini**, **OpenAI**, or **Anthropic** APIs directly from the browser
- API keys stored exclusively in browser localStorage (never transmitted)
- Seamless switching between Simulated and Live modes

### 📊 Laboratory Logs
- Full history of all prompt submissions with timestamps
- Search, filter, and reload previous experiments
- Score tracking across sessions

---

## 🚀 Getting Started

### Option 1: Live Demo
Visit the deployed version: **[https://aberaberhe787-cloud.github.io/prompt-engineering-lab/](https://aberaberhe787-cloud.github.io/prompt-engineering-lab/)**

### Option 2: Run Locally
```bash
git clone https://github.com/aberaberhe787-cloud/prompt-engineering-lab.git
cd prompt-engineering-lab
# Open index.html in any browser — no server required!
```

> **Zero dependencies. No Node.js. No npm. No build step.** Just open `index.html`.

---

## 📁 Project Structure

```
prompt-engineering-lab/
├── index.html                 # Main application shell
├── style.css                  # Full CSS design system (dark glassmorphism)
├── app.js                     # Core application engine & UI orchestrator
├── data/
│   ├── lessons.js             # Academy syllabus content database
│   └── challenges.js          # Gamified quest definitions & validators
├── services/
│   ├── tokenizer.js           # Sub-word BPE tokenizer with pill visualization
│   ├── metaprompt.js          # Metaprompt generation engine
│   ├── redteam.js             # Red-team attack simulation engine
│   ├── simulator.js           # Local LLM simulator & prompt auditor
│   └── api.js                 # Live API connector (Gemini/OpenAI/Anthropic)
└── README.md
```

---

## 🎓 Built For

This lab is designed as a companion tool for the **CBT Nuggets Prompt Engineering Course**, providing hands-on practice for every technique covered in the curriculum.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic structure & accessibility |
| **Vanilla CSS** | Custom dark glassmorphism design system |
| **Vanilla JavaScript** | Zero-framework, modular architecture |
| **Google Fonts** | Inter + Fira Code typography |
| **GitHub Pages** | Static deployment |

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

<p align="center">
  <b>Built with precision by a Senior Full-Stack Engineer</b><br>
  <i>Prompt Engineering Lab — Enterprise Studio V2</i>
</p>
