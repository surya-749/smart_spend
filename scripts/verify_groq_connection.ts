import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';

// Manual .env loading
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim();
                // Remove quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error reading .env file:", e);
}

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error("Error: GROQ_API_KEY is not set in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function main() {
    try {
        console.log("Testing Groq connection...");
        console.log("Using model: llama-3.3-70b-versatile");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello!" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Success! Response from Groq:");
        console.log(completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error connecting to Groq:", error);
        process.exit(1);
    }
}

main();
