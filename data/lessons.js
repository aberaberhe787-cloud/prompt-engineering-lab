// Register namespace
window.PromptLab = window.PromptLab || {};

window.PromptLab.lessons = [
    {
        id: "zero-mass-basics",
        title: "Zero-Mass Engineering",
        category: "Launchpad",
        tag: "Mass Reduction",
        description: "Eliminate structural bloat and filler words from prompts to pack maximum semantic density into minimal token footprints.",
        learningObjective: "Strip away conversational weight and write raw, ultra-dense foundational instructions.",
        concept: `Traditional prompting relies on heavy conversational phrasing (e.g., "Please could you be so kind as to write me a..."). Zero-Mass Engineering strips this away. LLMs do not need politeness or filler; they need semantic density. By removing "weight," you reduce token latency, lower API costs, and focus the model's attention mechanism purely on the structural constraints of the output.`,
        badPrompt: "Hello AI! I would really appreciate it if you could please write a short summary about black holes. Thank you so much!",
        goodPrompt: {
            system: "ROLE: Astrophysicist.\nTASK: Summarize black hole mechanics.\nFORMAT: 3 bullet points, highly technical.",
            user: "INPUT: Black holes.",
            fewShots: []
        },
        rationale: [
            "**Semantic Density**: Words like 'Hello' and 'please' are stripped out, leaving only actionable tokens.",
            "**Clear Directives**: Using capitalized keys (ROLE, TASK, FORMAT) acts as immediate visual and semantic anchors.",
            "**Token Efficiency**: The total footprint is reduced by over 60%, speeding up API transmission and model inference."
        ],
        diagramSteps: [
            { title: "Identify the Goal", desc: "Isolate the exact task you want performed without any verbs attached." },
            { title: "Strip Conversational Fluff", desc: "Remove all greetings, politeness, and unnecessary context." },
            { title: "Format as Directives", desc: "Use imperative commands and strict key-value pairs (e.g., TASK: ...)." }
        ]
    },
    {
        id: "cognitive-levitation",
        title: "Cognitive Levitation",
        category: "Launchpad",
        tag: "Processing",
        description: "Design prompts that force the AI to do 99% of the structural planning and schema generation.",
        learningObjective: "Shift the cognitive burden of data structuring entirely onto the LLM, leaving you to only define the boundary conditions.",
        concept: `Instead of manually writing out complex schemas, JSON structures, or step-by-step logic, Cognitive Levitation involves prompting the AI to generate its own operational frameworks before executing the task. You define the *boundaries* and the *end state*, and the AI calculates the intermediate structural steps.`,
        badPrompt: "Extract the data into a JSON object with a 'name' field, an 'age' field, and an 'occupation' field. Make sure 'age' is a number.",
        goodPrompt: {
            system: "1. Analyze the input text.\n2. Autonomously generate an optimal JSON schema to represent all key entities.\n3. Extract the data into your generated schema.\n4. Output ONLY valid JSON.",
            user: "INPUT: John is a 35-year-old software engineer.",
            fewShots: []
        },
        rationale: [
            "**Framework Delegation**: The AI builds the schema dynamically, adapting to the input rather than relying on a rigid, human-coded structure.",
            "**Sequential Execution**: The numbered steps force the AI to process the logic before formatting the output.",
            "**Boundary Definition**: 'Output ONLY valid JSON' is the final constraint that ensures system compatibility."
        ],
        diagramSteps: [
            { title: "Define the End State", desc: "Specify what the final output must look like (e.g., raw JSON, markdown table)." },
            { title: "Delegate the Structure", desc: "Instruct the AI to map the optimal schema based on the input." },
            { title: "Enforce Boundaries", desc: "Apply negative constraints to prevent conversational preamble or formatting drift." }
        ]
    },
    {
        id: "velocity-vectoring",
        title: "Velocity Vectoring",
        category: "Launchpad",
        tag: "Anchoring",
        description: "Use clear symbolic anchors (brackets, delimiters) to streamline processing speed and minimize execution drift.",
        learningObjective: "Implement structural markers to lock the model onto specific processing pathways.",
        concept: `Velocity Vectoring uses strict typographical anchors (like XML tags, brackets, and markdown boundaries) to separate instructions from data. This prevents 'execution drift'—where the model gets confused between what is a command and what is just payload data. By keeping the vectors clean, the model processes the prompt at maximum velocity without safety or logic errors.`,
        badPrompt: "Translate this text to French: The dog barked loudly. But do not translate the word 'dog'.",
        goodPrompt: {
            system: "TASK: Translate <payload> to French.\nRULE: Retain the word 'dog' in English.\nOUTPUT: Raw translated string.",
            user: "<payload>The dog barked loudly.</payload>",
            fewShots: []
        },
        rationale: [
            "**Payload Isolation**: The `<payload>` tags clearly separate the data from the instructions.",
            "**Rule Anchoring**: The `RULE:` directive is explicitly mapped, preventing the model from confusing it with the text to translate.",
            "**Drift Prevention**: The clean separation ensures the model doesn't attempt to translate the instructions themselves."
        ],
        diagramSteps: [
            { title: "Isolate Payload", desc: "Wrap all user data or external text in strict XML or markdown delimiters." },
            { title: "Declare Vectors", desc: "Use capitalized headers to point the model to instructions vs. rules." },
            { title: "Test Constraints", desc: "Ensure negative rules (what NOT to do) are placed immediately before the payload." }
        ]
    }
];
