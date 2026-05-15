const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
if (!keyMatch) {
  console.error("No key found");
  process.exit(1);
}
const key = keyMatch[1].trim();

const SYSTEM_PROMPT = "You are a test assistant.";
const userMessage = "Test message";
const MODEL = "gemini-1.5-flash-latest";

async function run() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const status = response.status;
  const text = await response.text();
  console.log("Status:", status);
  console.log("Response:", text);
}

run();
