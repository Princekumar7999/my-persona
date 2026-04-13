require('dotenv').config({ path: './.env.local' });
const { streamText } = require('ai');
const { google } = require('@ai-sdk/google');

async function main() {
  try {
    const response = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: 'say hi'
    });
    console.log("Keys:", Object.keys(response));
    console.log("Has toDataStreamResponse?", !!response.toDataStreamResponse);
  } catch (e) {
    console.error("FAILED:", e);
  }
}
main();
