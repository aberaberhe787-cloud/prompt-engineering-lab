// Register namespace
window.PromptLab = window.PromptLab || {};

window.PromptLab.api = {
    // Check if an API key is available in localStorage for a specific provider
    hasKey: function(provider) {
        const key = localStorage.getItem(`promptlab_key_${provider}`);
        return !!key && key.trim().length > 0;
    },

    // Save an API key
    saveKey: function(provider, key) {
        localStorage.setItem(`promptlab_key_${provider}`, key.trim());
    },

    // Delete an API key
    deleteKey: function(provider) {
        localStorage.removeItem(`promptlab_key_${provider}`);
    },

    // Retrieve an API key
    getKey: function(provider) {
        return localStorage.getItem(`promptlab_key_${provider}`) || "";
    },

    // Run a live prompt against the chosen provider's official endpoint
    runLivePrompt: async function(provider, system, user, fewShots, params) {
        const apiKey = this.getKey(provider);
        if (!apiKey) {
            throw new Error(`API key for ${provider.toUpperCase()} not found. Please add it in Settings.`);
        }

        const temp = parseFloat(params.temperature);
        const maxTokens = parseInt(params.maxTokens);

        if (provider === "gemini") {
            return await this.callGemini(apiKey, system, user, fewShots, temp, maxTokens);
        } else if (provider === "openai") {
            return await this.callOpenAI(apiKey, system, user, fewShots, temp, maxTokens);
        } else if (provider === "anthropic") {
            return await this.callAnthropic(apiKey, system, user, fewShots, temp, maxTokens);
        } else {
            throw new Error(`Unknown provider: ${provider}`);
        }
    },

    // Call Google Gemini API
    callGemini: async function(apiKey, system, user, fewShots, temperature, maxTokens) {
        const customModel = localStorage.getItem("promptlab_model_gemini");
        const model = (customModel && customModel.trim().length > 0) ? customModel.trim() : "gemini-2.0-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Prepare contents array with few-shots
        const contents = [];
        
        fewShots.forEach(shot => {
            contents.push({ role: "user", parts: [{ text: shot.input }] });
            contents.push({ role: "model", parts: [{ text: shot.output }] });
        });

        // Add the primary user query
        contents.push({ role: "user", parts: [{ text: user }] });

        // Prepare full payload
        const payload = {
            contents: contents,
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens
            }
        };

        // Add system instruction if provided
        if (system.trim().length > 0) {
            payload.systemInstruction = {
                parts: [{ text: system }]
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status} Error`;
            throw new Error(`Gemini API Error: ${errMsg}`);
        }

        const data = await response.json();
        
        // Extract text response
        const candidate = data.candidates?.[0];
        const textOutput = candidate?.content?.parts?.[0]?.text || "";
        
        return {
            reasoning: "", // Gemini doesn't separate thinking blocks in beta endpoint easily unless using specialized model
            output: textOutput
        };
    },

    // Call OpenAI GPT API
    callOpenAI: async function(apiKey, system, user, fewShots, temperature, maxTokens) {
        const url = "https://api.openai.com/v1/chat/completions";
        
        const messages = [];

        // Add system prompt
        if (system.trim().length > 0) {
            messages.push({ role: "system", content: system });
        }

        // Add few-shot examples
        fewShots.forEach(shot => {
            messages.push({ role: "user", content: shot.input });
            messages.push({ role: "assistant", content: shot.output });
        });

        // Add user query
        messages.push({ role: "user", content: user });

        const payload = {
            model: "gpt-4o-mini", // Cost effective, high speed
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status} Error`;
            throw new Error(`OpenAI API Error: ${errMsg}`);
        }

        const data = await response.json();
        const textOutput = data.choices?.[0]?.message?.content || "";

        return {
            reasoning: "",
            output: textOutput
        };
    },

    // Call Anthropic Claude API (Requires client-side bypass warning)
    callAnthropic: async function(apiKey, system, user, fewShots, temperature, maxTokens) {
        const url = "https://api.anthropic.com/v1/messages";

        const messages = [];

        // Add few shots
        fewShots.forEach(shot => {
            messages.push({ role: "user", content: shot.input });
            messages.push({ role: "assistant", content: shot.output });
        });

        // Add user query
        messages.push({ role: "user", content: user });

        const payload = {
            model: "claude-3-5-sonnet-20240620",
            max_tokens: maxTokens,
            messages: messages,
            temperature: temperature
        };

        if (system.trim().length > 0) {
            payload.system = system;
        }

        // Note: Direct browser requests to Anthropic will fail unless CORS is bypassed 
        // or a proxy is used. We add headers and capture CORS failures to explain to the user.
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                "dangerously-allow-browser": "true" // Anthropic JS SDK warning bypass header placeholder
            },
            body: JSON.stringify(payload)
        }).catch(err => {
            throw new Error(`Connection failed. Standard browsers block direct client-side requests to Anthropic's API due to strict CORS boundaries. Consider using Google Gemini or OpenAI which allow browser-direct calling.`);
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status} Error`;
            throw new Error(`Anthropic API Error: ${errMsg}`);
        }

        const data = await response.json();
        const textOutput = data.content?.[0]?.text || "";

        return {
            reasoning: "",
            output: textOutput
        };
    }
};
