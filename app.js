// Ensure namespaces exist
window.PromptLab = window.PromptLab || {};

document.addEventListener("DOMContentLoaded", () => {
    // --- Application State ---
    const state = {
        activeTab: "playground",
        fewShots: [],
        modelMode: "simulated", // "simulated" or "live"
        liveProvider: "gemini", // "gemini", "openai", "anthropic"
        activeLessonId: "role-prompting",
        activeQuestId: null, // null when in free playground, or quest ID when doing challenge
        solvedQuests: [],
        promptHistory: [],
        parameters: {
            temperature: 0.7,
            maxTokens: 512
        }
    };

    // --- DOM Cache Elements ---
    const dom = {
        // Nav Links
        navLinks: document.querySelectorAll(".nav-link"),
        views: {
            playground: document.getElementById("view-playground"),
            lessons: document.getElementById("view-lessons"),
            challenges: document.getElementById("view-challenges"),
            history: document.getElementById("view-history"),
            settings: document.getElementById("view-settings")
        },
        
        // Mode badge indicator
        modeIndicator: document.getElementById("mode-status-indicator"),
        modeLabel: document.getElementById("mode-status-label"),

        // Playground View Controls
        sysPromptInput: document.getElementById("playground-system-prompt"),
        userPromptInput: document.getElementById("playground-user-prompt"),
        btnSubmitPrompt: document.getElementById("btn-submit-prompt"),
        btnResetPlayground: document.getElementById("btn-reset-playground"),
        fewShotsList: document.getElementById("fewshot-list-container"),
        btnAddFewShot: document.getElementById("btn-add-fewshot"),
        
        // Output Controls
        outputStatus: document.getElementById("output-status"),
        spinner: document.getElementById("output-spinner"),
        cotBlock: document.getElementById("cot-terminal-block"),
        cotContent: document.getElementById("cot-content"),
        responseBlock: document.getElementById("response-content"),

        // Parameter Sliders
        sliderTemp: document.getElementById("param-temp"),
        sliderTokens: document.getElementById("param-tokens"),
        valTemp: document.getElementById("val-temp"),
        valTokens: document.getElementById("val-tokens"),

        // Assembler Drawer
        drawerHeader: document.getElementById("assembler-drawer-header"),
        drawerContent: document.getElementById("assembler-drawer-content"),

        // Auditor Panel
        scoreCircleBar: document.getElementById("score-circle-bar"),
        scoreValText: document.getElementById("score-val"),
        scoreTitleText: document.getElementById("score-grade-title"),
        scoreDescText: document.getElementById("score-grade-desc"),
        strengthsList: document.getElementById("auditor-strengths"),
        improvementsList: document.getElementById("auditor-improvements"),

        // Lessons View Elements
        lessonsList: document.getElementById("lessons-menu-list"),
        lessonDetailBox: document.getElementById("active-lesson-container"),

        // Challenges View Elements
        challengesGrid: document.getElementById("challenges-grid-view"),
        challengeWorkspace: document.getElementById("challenge-workspace-view"),

        // History View Elements
        historyList: document.getElementById("history-cards-container"),
        historySearch: document.getElementById("history-search"),
        historyClearBtn: document.getElementById("btn-clear-history"),

        // Settings View Elements
        modeSimulatedRadio: document.getElementById("mode-simulated"),
        modeLiveRadio: document.getElementById("mode-live"),
        liveSettingsBox: document.getElementById("live-provider-settings"),
        providerRadios: document.getElementsByName("live-provider"),
        keysInputs: {
            gemini: document.getElementById("key-gemini"),
            openai: document.getElementById("key-openai"),
            anthropic: document.getElementById("key-anthropic")
        },
        keysToggles: {
            gemini: document.getElementById("toggle-key-gemini"),
            openai: document.getElementById("toggle-key-openai"),
            anthropic: document.getElementById("toggle-key-anthropic")
        },
        btnSaveKeys: document.getElementById("btn-save-keys")
    };

    // --- State Persistence & Initialization ---
    function loadSavedState() {
        // Load solved quests
        const solved = localStorage.getItem("promptlab_solved_quests");
        if (solved) {
            state.solvedQuests = JSON.parse(solved);
        }

        // Load prompt history
        const history = localStorage.getItem("promptlab_history");
        if (history) {
            state.promptHistory = JSON.parse(history);
        }

        // Load mode configuration
        const mode = localStorage.getItem("promptlab_mode");
        if (mode) {
            state.modelMode = mode;
        }

        const provider = localStorage.getItem("promptlab_live_provider");
        if (provider) {
            state.liveProvider = provider;
        }
    }

    function savePromptHistory() {
        localStorage.setItem("promptlab_history", JSON.stringify(state.promptHistory));
    }

    function saveSolvedQuests() {
        localStorage.setItem("promptlab_solved_quests", JSON.stringify(state.solvedQuests));
    }

    // --- Tab Router ---
    function switchTab(tabId) {
        state.activeTab = tabId;
        
        // Update Nav Menu UI
        dom.navLinks.forEach(link => {
            if (link.getAttribute("data-tab") === tabId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Toggle View Containers
        Object.keys(dom.views).forEach(key => {
            if (key === tabId) {
                dom.views[key].classList.remove("hide");
            } else {
                dom.views[key].classList.add("hide");
            }
        });

        // Hide Challenge Workspace if returning to other tabs
        if (tabId !== "challenges") {
            dom.challengeWorkspace.classList.add("hide");
            dom.views.challenges.classList.remove("hide");
            state.activeQuestId = null;
        }

        // Init specific view components
        if (tabId === "playground") {
            updatePlaygroundAuditor();
            renderFewShots();
        } else if (tabId === "lessons") {
            renderLessonsMenu();
            renderActiveLesson();
        } else if (tabId === "challenges") {
            renderChallengesGrid();
        } else if (tabId === "history") {
            renderHistoryList();
        } else if (tabId === "settings") {
            renderSettingsForm();
        }
    }

    // --- Global Mode Badge ---
    function updateGlobalModeBadge() {
        if (state.modelMode === "simulated") {
            dom.modeIndicator.className = "mode-indicator simulated";
            dom.modeLabel.textContent = "Simulated Engine Active";
        } else {
            dom.modeIndicator.className = "mode-indicator";
            dom.modeLabel.textContent = `Live API Active: ${state.liveProvider.toUpperCase()}`;
        }
    }

    // --- PLAYGROUND MODULE ---
    
    // Add Few-Shot Item
    function addFewShotItem(input = "", output = "") {
        state.fewShots.push({ input, output });
        renderFewShots();
        updatePlaygroundAuditor();
    }

    // Remove Few-Shot Item
    function removeFewShotItem(index) {
        state.fewShots.splice(index, 1);
        renderFewShots();
        updatePlaygroundAuditor();
    }

    // Render Few-Shot Builder List
    function renderFewShots() {
        dom.fewShotsList.innerHTML = "";
        
        if (state.fewShots.length === 0) {
            dom.fewShotsList.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 8px;">No examples added yet. Click 'Add Example' to build a few-shot prompt.</div>`;
            return;
        }

        state.fewShots.forEach((shot, index) => {
            const card = document.createElement("div");
            card.className = "fewshot-item";
            card.innerHTML = `
                <div class="fewshot-item-fields">
                    <div class="fewshot-input-box">
                        <label>User Example Input</label>
                        <textarea class="fewshot-textarea" data-index="${index}" data-field="input" placeholder="User query context...">${shot.input}</textarea>
                    </div>
                    <div class="fewshot-input-box">
                        <label>Model Target Output</label>
                        <textarea class="fewshot-textarea" data-index="${index}" data-field="output" placeholder="Desired model response structure...">${shot.output}</textarea>
                    </div>
                </div>
                <button class="btn-remove-shot" data-index="${index}" title="Remove Example">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            dom.fewShotsList.appendChild(card);
        });

        // Attach textarea change handlers
        dom.fewShotsList.querySelectorAll(".fewshot-textarea").forEach(textarea => {
            textarea.addEventListener("input", (e) => {
                const index = parseInt(e.target.getAttribute("data-index"));
                const field = e.target.getAttribute("data-field");
                state.fewShots[index][field] = e.target.value;
                updatePlaygroundAuditor();
            });
        });

        // Attach remove handlers
        dom.fewShotsList.querySelectorAll(".btn-remove-shot").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.getAttribute("data-index"));
                removeFewShotItem(index);
            });
        });
    }

    // Update real-time Auditor scoring and recommendation list
    function updatePlaygroundAuditor() {
        const sysText = dom.sysPromptInput.value;
        const userText = dom.userPromptInput.value;
        
        const audit = window.PromptLab.simulator.auditPrompt(sysText, userText, state.fewShots);

        // Update radial progress bar svg offset (220 max stroke-dasharray)
        const offset = 220 - (220 * audit.score) / 100;
        dom.scoreCircleBar.style.strokeDashoffset = offset;
        dom.scoreValText.textContent = audit.score;

        // Visual score scaling alerts
        if (audit.score >= 85) {
            dom.scoreValText.className = "score-text text-success";
            dom.scoreTitleText.textContent = "Excellent Prompt Design!";
            dom.scoreDescText.textContent = "Your prompt contains expert roles, delimitations, constraints, and structuring templates.";
        } else if (audit.score >= 55) {
            dom.scoreValText.className = "score-text text-warning";
            dom.scoreTitleText.textContent = "Solid Foundation";
            dom.scoreDescText.textContent = "Your prompt is solid, but could be made safer or highly structured with delimiters or negative constraints.";
        } else {
            dom.scoreValText.className = "score-text text-danger";
            dom.scoreTitleText.textContent = "Basic Query";
            dom.scoreDescText.textContent = "Add a System role, wrap data in tags, and specify what the model should avoid to boost accuracy.";
        }

        // Render Strengths list
        dom.strengthsList.innerHTML = "";
        if (audit.strengths.length === 0) {
            dom.strengthsList.innerHTML = `<li style="color: var(--text-muted); font-style: italic;">No specific strengths detected yet.</li>`;
        } else {
            audit.strengths.forEach(str => {
                const li = document.createElement("li");
                li.textContent = str;
                dom.strengthsList.appendChild(li);
            });
        }

        // Render Improvements list
        dom.improvementsList.innerHTML = "";
        if (audit.improvements.length === 0) {
            dom.improvementsList.innerHTML = `<li class="text-success" style="font-weight: 500;">✓ Excellent. Your prompt meets all quality requirements!</li>`;
        } else {
            audit.improvements.forEach(imp => {
                const li = document.createElement("li");
                li.textContent = imp;
                dom.improvementsList.appendChild(li);
            });
        }

        // Live Render Assembler compiled tokens
        updatePromptAssembler(sysText, userText);
    }

    // Assemble and render prompt highlighting visualizer
    function updatePromptAssembler(sys, user) {
        let compiled = "";

        if (sys.trim().length > 0) {
            compiled += `<span class="system-block">&lt;System Instruct&gt;\n${escapeHtml(sys)}\n&lt;/System Instruct&gt;</span>\n\n`;
        }

        state.fewShots.forEach((shot, index) => {
            if (shot.input.trim().length > 0 || shot.output.trim().length > 0) {
                compiled += `<span class="shot-block">&lt;Example ${index + 1} Input&gt;\n${escapeHtml(shot.input)}\n&lt;/Example ${index + 1} Input&gt;\n`;
                compiled += `&lt;Example ${index + 1} Output&gt;\n${escapeHtml(shot.output)}\n&lt;/Example ${index + 1} Output&gt;</span>\n\n`;
            }
        });

        compiled += `<span class="user-block">&lt;User Message&gt;\n${escapeHtml(user)}\n&lt;/User Message&gt;</span>`;

        dom.drawerContent.innerHTML = compiled;
    }

    // Run Prompt submit routine
    async function executePrompt() {
        const sysText = dom.sysPromptInput.value;
        const userText = dom.userPromptInput.value;

        if (userText.trim().length === 0) {
            alert("User Prompt cannot be empty.");
            return;
        }

        // Set Loading UI
        dom.btnSubmitPrompt.disabled = true;
        dom.btnSubmitPrompt.textContent = "Evaluating...";
        dom.outputStatus.textContent = "Processing Tokens...";
        dom.spinner.style.display = "block";
        dom.cotBlock.style.display = "none";
        dom.responseBlock.textContent = "";
        dom.responseBlock.className = "response-block response-placeholder";
        dom.responseBlock.textContent = "Awaiting response data...";

        try {
            let result;

            if (state.modelMode === "simulated") {
                result = await window.PromptLab.simulator.generateSimulatedResponse(
                    sysText,
                    userText,
                    state.fewShots,
                    state.parameters,
                    state.activeQuestId
                );
            } else {
                // Live mode API connection
                dom.outputStatus.textContent = `Querying Live API: ${state.liveProvider.toUpperCase()}...`;
                result = await window.PromptLab.api.runLivePrompt(
                    state.liveProvider,
                    sysText,
                    userText,
                    state.fewShots,
                    state.parameters
                );
            }

            // Stream / Display result
            dom.outputStatus.textContent = "Tokens Compiled.";
            dom.spinner.style.display = "none";

            // If Reasoning/CoT is generated, show it
            if (result.reasoning) {
                dom.cotBlock.style.display = "block";
                dom.cotContent.textContent = "";
                streamText(result.reasoning, dom.cotContent, 10);
            }

            // Stream response content
            dom.responseBlock.className = "response-block";
            dom.responseBlock.textContent = "";
            await streamText(result.output, dom.responseBlock, 15);

            // Audit score for history logging
            const scoreObj = window.PromptLab.simulator.auditPrompt(sysText, userText, state.fewShots);

            // Save execution in history list (avoid saving test vulnerability audits in history if it's the security level)
            if (state.activeQuestId !== "jailbreak-guardian") {
                const historyItem = {
                    id: "hist_" + Date.now(),
                    timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
                    mode: state.modelMode,
                    provider: state.modelMode === "live" ? state.liveProvider : "simulator",
                    score: scoreObj.score,
                    system: sysText,
                    user: userText,
                    fewShots: [...state.fewShots],
                    output: result.output
                };
                state.promptHistory.unshift(historyItem);
                savePromptHistory();
            }

            // If active in a Quest, evaluate validator!
            if (state.activeQuestId) {
                evaluateQuestSuccess(result.output, result);
            }

        } catch (error) {
            dom.spinner.style.display = "none";
            dom.outputStatus.textContent = "Error Occurred.";
            dom.responseBlock.className = "response-block text-danger";
            dom.responseBlock.textContent = error.message;
        } finally {
            dom.btnSubmitPrompt.disabled = false;
            dom.btnSubmitPrompt.innerHTML = `Submit Prompt 
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
        }
    }

    // Helper text streaming typewriter simulation
    function streamText(text, container, speed) {
        return new Promise((resolve) => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    container.textContent += text.charAt(i);
                    i++;
                    // Auto-scroll terminal window to bottom
                    const terminal = container.closest(".terminal-window");
                    if (terminal) terminal.scrollTop = terminal.scrollHeight;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    }

    // --- LESSONS MODULE ---
    
    // Render Syllabus Menu
    function renderLessonsMenu() {
        dom.lessonsList.innerHTML = "";
        window.PromptLab.lessons.forEach(lesson => {
            const card = document.createElement("div");
            card.className = `lesson-card ${state.activeLessonId === lesson.id ? 'active' : ''}`;
            card.setAttribute("data-id", lesson.id);
            card.innerHTML = `
                <div class="lesson-meta">${lesson.category} • ${lesson.tag}</div>
                <h3>${lesson.title}</h3>
                <p>${lesson.description.substring(0, 75)}...</p>
            `;
            
            card.addEventListener("click", () => {
                state.activeLessonId = lesson.id;
                renderLessonsMenu();
                renderActiveLesson();
            });

            dom.lessonsList.appendChild(card);
        });
    }

    // Render Selected active lesson workspace
    function renderActiveLesson() {
        const lesson = window.PromptLab.lessons.find(l => l.id === state.activeLessonId);
        if (!lesson) return;

        dom.lessonDetailBox.innerHTML = `
            <div class="lesson-header-block">
                <span class="tag">${lesson.tag}</span>
                <h2>${lesson.title}</h2>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px;">${lesson.description}</p>
            </div>

            <div class="glass-card">
                <h4 class="lesson-section-title">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    The Core Concept
                </h4>
                <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">${lesson.concept}</p>
            </div>

            <div class="glass-card">
                <h4 class="lesson-section-title">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"></path></svg>
                    Interactive Prompt Comparison
                </h4>
                <div class="prompt-compare-grid">
                    <div class="prompt-compare-card bad">
                        <div class="compare-title">Bad (Intuitive) Prompt</div>
                        <div class="compare-body">${escapeHtml(lesson.badPrompt)}</div>
                    </div>
                    <div class="prompt-compare-card good">
                        <div class="compare-title">Good (Optimized) Prompt</div>
                        <div class="compare-body"><b>[SYSTEM]</b>\n${escapeHtml(lesson.goodPrompt.system)}\n\n<b>[USER]</b>\n${escapeHtml(lesson.goodPrompt.user)}</div>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 20px;">
                    <h5 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Why It Works (Direct Design Audits):</h5>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                        ${lesson.rationale.map(r => `<li><span class="text-success" style="font-weight:700;">✓</span> ${r}</li>`).join("")}
                    </ul>
                </div>
            </div>

            <div class="glass-card lesson-diagram-card">
                <h4 class="lesson-section-title">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17m0 0V4m0 4h4"></path></svg>
                    Mental Model: Progressive Layout Flow
                </h4>
                <div class="interactive-diagram">
                    ${lesson.diagramSteps.map((step, idx) => `
                        <div class="diag-step ${idx === 0 ? 'active' : ''}">
                            <div class="diag-step-num">${idx + 1}</div>
                            <div class="diag-step-content">
                                <h4>${step.title}</h4>
                                <p>${step.desc}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button class="btn btn-accent" id="btn-load-lesson-template" style="padding: 12px 24px;">
                    Load Template into Studio Studio &rarr;
                </button>
            </div>
        `;

        // Add load template button handler
        document.getElementById("btn-load-lesson-template").addEventListener("click", () => {
            // Load templates into Playground state
            dom.sysPromptInput.value = lesson.goodPrompt.system;
            dom.userPromptInput.value = lesson.goodPrompt.user;
            state.fewShots = lesson.goodPrompt.fewShots ? [...lesson.goodPrompt.fewShots] : [];
            state.activeQuestId = null; // free playground
            
            // Navigate to Playground
            switchTab("playground");
            
            // Clear outputs
            dom.cotBlock.style.display = "none";
            dom.responseBlock.textContent = "Playground preloaded with Lesson template! Click Submit to evaluate.";
            dom.responseBlock.className = "response-block response-placeholder";
        });

        // Add click events to diagrams steps to activate them dynamically
        const diagSteps = dom.lessonDetailBox.querySelectorAll(".diag-step");
        diagSteps.forEach((step, idx) => {
            step.addEventListener("click", () => {
                diagSteps.forEach(s => s.classList.remove("active"));
                step.classList.add("active");
            });
        });
    }

    // --- CHALLENGES MODULE ---
    
    // Render Quests Grid List
    function renderChallengesGrid() {
        dom.challengesGrid.innerHTML = "";
        window.PromptLab.challenges.forEach(quest => {
            const isSolved = state.solvedQuests.includes(quest.id);
            const card = document.createElement("div");
            card.className = `glass-card challenge-card ${isSolved ? 'solved' : ''}`;
            card.innerHTML = `
                <div class="challenge-badge-overlay">🏆 SOLVED</div>
                <div class="challenge-card-header">
                    <span class="challenge-difficulty ${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>
                    <h3>${quest.title}</h3>
                    <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight:700; margin-top: 2px;">Reward Badge: [${quest.badge}]</div>
                </div>
                <p>${quest.description}</p>
                <div>
                    <button class="btn ${isSolved ? 'btn-secondary' : 'btn-primary'} btn-start-quest" data-id="${quest.id}" style="width: 100%;">
                        ${isSolved ? "Practice Again" : "Solve Quest"}
                    </button>
                </div>
            `;

            card.querySelector(".btn-start-quest").addEventListener("click", () => {
                startChallenge(quest.id);
            });

            dom.challengesGrid.appendChild(card);
        });
    }

    // Initialize Challenge Workspace
    function startChallenge(questId) {
        const quest = window.PromptLab.challenges.find(q => q.id === questId);
        if (!quest) return;

        state.activeQuestId = questId;

        // Populate Playground inputs automatically with Quest placeholders
        dom.sysPromptInput.value = quest.placeholderSystem || "";
        dom.userPromptInput.value = quest.targetInput || "";
        state.fewShots = [];
        renderFewShots();

        // Switch layout to showing the specialized Challenge Details sidebar
        dom.views.challenges.classList.add("hide");
        dom.challengeWorkspace.classList.remove("hide");

        // Renders challenge details sidebar panel
        const detailsPanel = document.getElementById("challenge-info-panel");
        const solved = state.solvedQuests.includes(quest.id);
        
        detailsPanel.innerHTML = `
            <div class="glass-card" style="border-left: 4px solid var(--accent-cyan);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="challenge-difficulty ${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>
                    <button class="btn btn-secondary" id="btn-abort-quest" style="padding: 4px 8px; font-size: 0.75rem;">&larr; Back</button>
                </div>
                <h2 style="font-size: 1.3rem; font-weight:700;">${quest.title}</h2>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">${quest.instructions}</p>
            </div>

            <div class="glass-card">
                <h3 style="font-size:0.9rem; font-weight:700; margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Verification Rules
                </h3>
                <div id="quest-rules-checklist">
                    ${quest.validationRules.map(rule => `
                        <div class="test-case-item">
                            <div class="test-case-info">
                                <h5>${rule.name}</h5>
                            </div>
                            <span class="test-status-badge pending" id="rule-badge-${rule.id}">Pending</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="glass-card" style="background: rgba(0, 0, 0, 0.2);">
                <h4 style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted); margin-bottom: 6px;">Evaluation Input Parameters:</h4>
                <div style="font-family: var(--font-mono); font-size:0.75rem; color:var(--text-secondary); background:rgba(0,0,0,0.3); padding:10px; border-radius:var(--radius-sm); max-height: 100px; overflow-y:auto;">
                    ${quest.targetInput}
                </div>
            </div>

            <div style="display:flex; gap: 12px;">
                <button class="btn btn-primary" id="btn-quest-run" style="flex-grow:1; padding: 14px;">
                    Test & Validate Prompt &rarr;
                </button>
            </div>
        `;

        // Abort Quest event
        document.getElementById("btn-abort-quest").addEventListener("click", () => {
            dom.challengeWorkspace.classList.add("hide");
            dom.views.challenges.classList.remove("hide");
            state.activeQuestId = null;
        });

        // Run validation click event
        document.getElementById("btn-quest-run").addEventListener("click", async () => {
            // Lock UI and route execution directly into Playground's execute Prompt 
            // since state.activeQuestId is set, executePrompt() will trigger evaluation hooks!
            switchTab("playground");
            executePrompt();
        });
    }

    // Evaluate Quest Success once LLM output completes
    function evaluateQuestSuccess(output, payload) {
        const quest = window.PromptLab.challenges.find(q => q.id === state.activeQuestId);
        if (!quest) return;

        // Switch user back to challenges workspace to see checks ticked off
        switchTab("challenges");
        dom.views.challenges.classList.add("hide");
        dom.challengeWorkspace.classList.remove("hide");

        // Run validation
        const result = quest.validate(output, payload);

        // Update verification rules UI
        Object.keys(result.checks).forEach(ruleId => {
            const passed = result.checks[ruleId];
            const badge = document.getElementById(`rule-badge-${ruleId}`);
            if (badge) {
                if (passed) {
                    badge.className = "test-status-badge passed";
                    badge.textContent = "Passed";
                } else {
                    badge.className = "test-status-badge failed";
                    badge.textContent = "Failed";
                }
            }
        });

        // Award badge celebration!
        if (result.passed) {
            if (!state.solvedQuests.includes(quest.id)) {
                state.solvedQuests.push(quest.id);
                saveSolvedQuests();
            }

            // High priority custom alert modal or panel modification
            const container = document.getElementById("challenge-info-panel");
            const successOverlay = document.createElement("div");
            successOverlay.className = "glass-card";
            successOverlay.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)";
            successOverlay.style.borderColor = "var(--accent-green)";
            successOverlay.style.marginTop = "20px";
            successOverlay.style.textAlign = "center";
            successOverlay.innerHTML = `
                <h3 style="font-size:1.3rem; font-weight:700; color: #fff;">🎉 Quest Completed!</h3>
                <p style="font-size:0.85rem; color:var(--text-primary); margin-top: 6px;">You have successfully earned the reward badge:</p>
                <div style="font-weight:800; font-size:1.2rem; color: var(--accent-cyan); margin: 10px 0; text-transform:uppercase; letter-spacing:1px;">[${quest.badge}]</div>
                <p style="font-size:0.75rem; color:var(--text-secondary);">Your prompt has passed all logical and syntactic security checks.</p>
            `;
            container.appendChild(successOverlay);
        }
    }

    // --- HISTORY MODULE ---
    
    // Render Historical Logs
    function renderHistoryList() {
        dom.historyList.innerHTML = "";
        
        const filter = dom.historySearch.value.trim().toLowerCase();
        const filtered = state.promptHistory.filter(item => {
            return item.system.toLowerCase().includes(filter) || 
                   item.user.toLowerCase().includes(filter) || 
                   item.output.toLowerCase().includes(filter) ||
                   item.provider.toLowerCase().includes(filter);
        });

        if (filtered.length === 0) {
            dom.historyList.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 32px;">No prompt history records found.</div>`;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement("div");
            card.className = "history-item";
            card.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-meta">
                        <span>🕒 ${item.timestamp}</span>
                        <span>🤖 Model: <b>${item.provider.toUpperCase()}</b> (${item.mode})</span>
                        <span class="score-tag">Score: ${item.score}/100</span>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-secondary btn-reload-history" data-id="${item.id}" style="padding: 4px 8px; font-size: 0.75rem;">Load to Studio</button>
                        <button class="btn btn-secondary text-danger btn-delete-history" data-id="${item.id}" style="padding: 4px 8px; font-size: 0.75rem; border-color: transparent;">Delete</button>
                    </div>
                </div>
                <div class="history-item-body">
                    <div class="history-text-block">
                        <h5>System Prompt</h5>
                        <p>${escapeHtml(item.system || "(Empty)")}</p>
                    </div>
                    <div class="history-text-block">
                        <h5>Model Response</h5>
                        <p>${escapeHtml(item.output)}</p>
                    </div>
                </div>
            `;

            // Reload history to playground
            card.querySelector(".btn-reload-history").addEventListener("click", () => {
                dom.sysPromptInput.value = item.system;
                dom.userPromptInput.value = item.user;
                state.fewShots = [...item.fewShots];
                state.activeQuestId = null;
                switchTab("playground");
                
                dom.cotBlock.style.display = "none";
                dom.responseBlock.textContent = "Historical prompt loaded successfully!";
                dom.responseBlock.className = "response-block response-placeholder";
            });

            // Delete history item
            card.querySelector(".btn-delete-history").addEventListener("click", () => {
                state.promptHistory = state.promptHistory.filter(i => i.id !== item.id);
                savePromptHistory();
                renderHistoryList();
            });

            dom.historyList.appendChild(card);
        });
    }

    // --- SETTINGS MODULE ---
    
    // Populate form fields from state
    function renderSettingsForm() {
        if (state.modelMode === "simulated") {
            dom.modeSimulatedRadio.checked = true;
            dom.liveSettingsBox.classList.add("hide");
        } else {
            dom.modeLiveRadio.checked = true;
            dom.liveSettingsBox.classList.remove("hide");
        }

        // Provider select radios
        dom.providerRadios.forEach(radio => {
            if (radio.value === state.liveProvider) {
                radio.checked = true;
                radio.closest(".radio-option").classList.add("selected");
            } else {
                radio.checked = false;
                radio.closest(".radio-option").classList.remove("selected");
            }
        });

        // Load api keys
        dom.keysInputs.gemini.value = window.PromptLab.api.getKey("gemini");
        dom.keysInputs.openai.value = window.PromptLab.api.getKey("openai");
        dom.keysInputs.anthropic.value = window.PromptLab.api.getKey("anthropic");
    }

    // --- EVENT LISTENERS REGISTRATION ---
    
    // Tab sidebar switching click event
    dom.navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = link.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Param sliders update handlers
    dom.sliderTemp.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value).toFixed(2);
        dom.valTemp.textContent = val;
        state.parameters.temperature = val;
    });

    dom.sliderTokens.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        dom.valTokens.textContent = val;
        state.parameters.maxTokens = val;
    });

    // Add few shot click
    dom.btnAddFewShot.addEventListener("click", () => {
        addFewShotItem("", "");
    });

    // Assembler Drawer toggle click
    dom.drawerHeader.addEventListener("click", () => {
        const isOpen = dom.drawerHeader.classList.toggle("open");
        if (isOpen) {
            dom.drawerContent.style.display = "block";
        } else {
            dom.drawerContent.style.display = "none";
        }
    });

    // Form keypress change triggers auditor scoring
    dom.sysPromptInput.addEventListener("input", updatePlaygroundAuditor);
    dom.userPromptInput.addEventListener("input", updatePlaygroundAuditor);

    // Submit Prompt click event
    dom.btnSubmitPrompt.addEventListener("click", executePrompt);

    // Reset playground inputs click event
    dom.btnResetPlayground.addEventListener("click", () => {
        dom.sysPromptInput.value = "";
        dom.userPromptInput.value = "";
        state.fewShots = [];
        state.activeQuestId = null;
        renderFewShots();
        updatePlaygroundAuditor();
        
        dom.cotBlock.style.display = "none";
        dom.responseBlock.textContent = "Playground inputs reset. Ready for prompt design.";
        dom.responseBlock.className = "response-block response-placeholder";
    });

    // History search input event
    dom.historySearch.addEventListener("input", renderHistoryList);

    // History Clear All event
    dom.historyClearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete your entire prompt laboratory history?")) {
            state.promptHistory = [];
            savePromptHistory();
            renderHistoryList();
        }
    });

    // Settings Mode selection change event
    dom.modeSimulatedRadio.addEventListener("change", () => {
        state.modelMode = "simulated";
        localStorage.setItem("promptlab_mode", "simulated");
        dom.liveSettingsBox.classList.add("hide");
        updateGlobalModeBadge();
    });

    dom.modeLiveRadio.addEventListener("change", () => {
        state.modelMode = "live";
        localStorage.setItem("promptlab_mode", "live");
        dom.liveSettingsBox.classList.remove("hide");
        updateGlobalModeBadge();
    });

    // Settings Live provider selected radio changes
    dom.providerRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            dom.providerRadios.forEach(r => r.closest(".radio-option").classList.remove("selected"));
            
            const target = e.target;
            target.closest(".radio-option").classList.add("selected");
            state.liveProvider = target.value;
            localStorage.setItem("promptlab_live_provider", target.value);
            updateGlobalModeBadge();
        });
    });

    // API Key inputs hide/show visibility toggling
    Object.keys(dom.keysToggles).forEach(provider => {
        dom.keysToggles[provider].addEventListener("click", () => {
            const input = dom.keysInputs[provider];
            const type = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", type);
            
            // Toggle eye icon
            const btn = dom.keysToggles[provider];
            if (type === "text") {
                btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`;
            } else {
                btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
            }
        });
    });

    // Save API keys click event
    dom.btnSaveKeys.addEventListener("click", () => {
        Object.keys(dom.keysInputs).forEach(provider => {
            const key = dom.keysInputs[provider].value.trim();
            if (key) {
                window.PromptLab.api.saveKey(provider, key);
            } else {
                window.PromptLab.api.deleteKey(provider);
            }
        });
        alert("API keys successfully saved locally.");
    });

    // --- HTML Helper Escaping ---
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- EXECUTION START ---
    loadSavedState();
    updateGlobalModeBadge();
    switchTab("playground");
});
