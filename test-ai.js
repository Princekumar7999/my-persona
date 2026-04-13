require('dotenv').config({ path: './.env.local' });
const { generateText } = require('ai');
const { google } = require('@ai-sdk/google');

async function main() {
  try {
    const response = await generateText({
      model: google('gemini-1.5-flash-latest'),
      prompt: 'say hi'
    });
    console.log("SUCCESS:", response.text);
  } catch (e) {
    console.error("FAILED:", e);
  }
}
main();
