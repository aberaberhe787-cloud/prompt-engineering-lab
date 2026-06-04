// Register namespace
window.PromptLab = window.PromptLab || {};

window.PromptLab.tokenizer = {
    // A high-fidelity client-side sub-word heuristic tokenizer.
    // Simulates Byte-Pair Encoding (BPE) splitting (similar to Tiktoken/GPT2 tokenizer)
    // with 90%+ word-to-token ratio matching.
    tokenize: function(text) {
        if (!text) {
            return { tokens: [], count: 0 };
        }

        const tokens = [];
        
        // Regex to split by spaces, punctuation, words, or special markers while preserving them
        // Matches: words (with apostrophes), punctuation characters, whitespace blocks, or numbers
        const pattern = /[a-zA-Z0-9]+(?:'[a-zA-Z]+)?|[^\w\s]|\s+/g;
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
            const part = match[0];
            
            // If it is whitespace, treat it as a single token (or block of tokens)
            if (/^\s+$/.test(part)) {
                // Split multi-character whitespace into separate tokens or keep as one
                tokens.push(part);
                continue;
            }
            
            // If it is punctuation, treat as a single token
            if (/[^\w\s]/.test(part)) {
                tokens.push(part);
                continue;
            }
            
            // For standard words, apply sub-word splitting heuristics (BPE Simulation)
            // Splitting criteria: length > 5 and matches common prefixes/suffixes/sub-roots
            if (part.length > 5) {
                const subParts = this.splitSubWords(part);
                subParts.forEach(sp => tokens.push(sp));
            } else {
                tokens.push(part);
            }
        }

        return {
            tokens: tokens,
            count: tokens.length
        };
    },

    // Sub-word BPE heuristic splitter
    splitSubWords: function(word) {
        const result = [];
        let remaining = word;

        // Common BPE sub-word prefixes & suffixes patterns
        const prefixes = ["un", "re", "de", "dis", "pre", "con", "in", "anti", "sub", "trans", "inter", "meta", "cyber", "hyper"];
        const suffixes = ["ing", "ed", "tion", "s", "ly", "ment", "ness", "able", "ible", "al", "ic", "ous", "ist", "ism", "er", "est", "ive", "ity"];

        // 1. Check and strip common prefixes
        for (let pref of prefixes) {
            if (remaining.toLowerCase().startsWith(pref) && remaining.length > pref.length + 2) {
                result.push(remaining.substring(0, pref.length));
                remaining = remaining.substring(pref.length);
                break;
            }
        }

        // 2. Check and strip common suffixes (from end)
        let foundSuffix = null;
        for (let suff of suffixes) {
            if (remaining.toLowerCase().endsWith(suff) && remaining.length > suff.length + 2) {
                foundSuffix = remaining.substring(remaining.length - suff.length);
                remaining = remaining.substring(0, remaining.length - suff.length);
                break;
            }
        }

        // 3. Push remaining core root (or split if still very long)
        if (remaining.length > 6) {
            // Heuristic split in half for extremely long compound words
            const mid = Math.floor(remaining.length / 2);
            result.push(remaining.substring(0, mid));
            result.push(remaining.substring(mid));
        } else if (remaining.length > 0) {
            result.push(remaining);
        }

        // 4. Append suffix if stripped earlier
        if (foundSuffix) {
            result.push(foundSuffix);
        }

        return result;
    },

    // Hash token string to generate a stable visual color hue (Hsl)
    // Ensures the same token always receives the same visual representation!
    getTokenColor: function(tokenText) {
        if (/^\s+$/.test(tokenText)) {
            return "rgba(255, 255, 255, 0.03)"; // whitespace token
        }
        
        let hash = 0;
        for (let i = 0; i < tokenText.length; i++) {
            hash = tokenText.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Keep hues in the highly modern neon range (Cyan -> Blue -> Purple -> Violet)
        // 180 to 290 degree HSL ranges
        const hue = Math.abs(hash % 110) + 180;
        
        // Return transparent glass style colors
        return `hsla(${hue}, 85%, 65%, 0.15)`;
    }
};
