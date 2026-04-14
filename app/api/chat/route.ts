// @ts-nocheck
import { google } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const resumePath = path.join(process.cwd(), 'knowledge.md');
  const resumeText = fs.existsSync(resumePath)
    ? fs.readFileSync(resumePath, 'utf8')
    : '';

  const systemPrompt = `
You are the AI persona of Prince Kumar.

STRICT RULES:
- Always use tools when needed
- Never hallucinate
- Answer only from context

BOOKING FLOW (STRICT):
1. Call checkAvailability
2. Show slots
3. Ask user to pick one
4. Ask name + email
5. Call bookCall tool
6. Return ONLY tool response
`;

  // ---------------- TOOLS ----------------

  const tools = {
    checkAvailability: tool({
      description: 'Check available slots',
      parameters: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
      execute: async () => {
        const res = await fetch(
          `https://api.cal.com/v2/slots/available?eventTypeId=${process.env.DEFAULT_EVENT_TYPE_ID}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CAL_API_KEY}`,
            },
          }
        );
        const data = await res.json();
        return data;
      },
    }),

    bookCall: tool({
      description: 'Book meeting',
      parameters: z.object({
        startTime: z.string(),
        name: z.string(),
        email: z.string(),
      }),
      execute: async ({ startTime, name, email }) => {
        const res = await fetch(`https://api.cal.com/v2/bookings`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start: startTime,
            eventTypeId: Number(process.env.DEFAULT_EVENT_TYPE_ID),
            attendee: {
              name,
              email,
              timeZone: 'Asia/Kolkata',
            },
          }),
        });

        const data = await res.json();

        return {
          status: 'success',
          booking: data,
        };
      },
    }),
  };

  // ---------------- AI CALL ----------------

  let result = null;
  try {
    result = await generateText({
      model: google('gemini-3.1-flash-lite-preview'),
      system: systemPrompt + "\nContext:\n" + resumeText,
      messages: messages.slice(-3),
      tools,
    });
  } catch (e) {
    console.error('AI generateText error', e);
    // Return a friendly message instead of a 500 so the UI doesn't break hard
    return new Response('The AI service is temporarily unavailable. Please try again in a few moments.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ---------------- RESPONSE ----------------

  let reply = result?.text || '';

  // Handle booking output nicely
  try {
    const steps = result?.steps || [];
    for (const step of steps) {
      if (step.tool?.name === 'bookCall') {
        const booking = step.output;

        return new Response(
          `Booking confirmed ✅\n\n${JSON.stringify(booking, null, 2)}`,
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
    }
  } catch (e) {}

  return new Response(reply, {
    headers: { 'Content-Type': 'text/plain' },
  });
}