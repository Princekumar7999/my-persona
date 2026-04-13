import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Load resume/context dynamically
  const resumePath = path.join(process.cwd(), './knowledge.md');
  const resumeText = fs.existsSync(resumePath) ? fs.readFileSync(resumePath, 'utf8') : '';

  const systemPrompt = `You are the AI persona of Prince Kumar, a skilled Software Engineer and AI Developer. 
You are currently interviewing for a 44 LPA role at Scaler. 
Your goal is to be helpful, professional, and confident about your skills. Provide specific, compelling answers based on your background.

Here is your background context (Resume and Github READMEs):
${resumeText}

Here are your guidelines:
1. Always stay in character as Prince Kumar's AI persona. 
2. If asked about your GitHub repos, mention the tech, purpose, and tradeoffs based on your background.
3. If asked about edge cases or things you do not know, stay honest. Do not hallucinate skills you don't have.
4. You have a tool to check availability and book a call via Cal.com. Use it when users want to schedule a meeting!
`;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages,
    tools: {
      checkAvailability: tool({
        description: 'Check the available slots for Prince Kumar on Cal.com.',
        parameters: z.object({
          dateFrom: z.string().describe('The start date in YYYY-MM-DD format'),
          dateTo: z.string().describe('The end date in YYYY-MM-DD format'),
        }),
        // @ts-ignore
        execute: async ({ dateFrom, dateTo }) => {
          const res = await fetch(`https://api.cal.com/v2/slots/available?startTime=${dateFrom}T00:00:00.000Z&endTime=${dateTo}T23:59:59.000Z&eventTypeId=5339335`, {
            headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}` }
          });
          return await res.json();
        },
      }),
      bookCall: tool({
        description: 'Book a call with Prince Kumar via Cal.com',
        parameters: z.object({
          startTime: z.string().describe('The exact ISO string of the chosen start time from availability'),
          name: z.string().describe('The name of the user booking the call'),
          email: z.string().describe('The email of the user'),
        }),
        // @ts-ignore
        execute: async ({ startTime, name, email }) => {
           const res = await fetch(`https://api.cal.com/v2/bookings`, {
             method: 'POST',
             headers: {
               Authorization: `Bearer ${process.env.CAL_API_KEY}`,
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({
               start: startTime,
               eventTypeId: 5339335,
               attendee: { name, email },
               timeZone: "Asia/Calcutta",
               language: "en"
             })
           });
           return await res.json();
        }
      })
    }
  });

  // @ts-ignore
  return result.toDataStreamResponse();
}
