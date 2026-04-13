# Prince Kumar AI Persona

This repository contains the source code for an interactive AI Persona (Voice & Chat Agent) capable of speaking intelligently about Prince's resume, GitHub projects, and scheduling interviews natively to a Cal.com calendar.

## 🏗 Architecture

```mermaid
graph TD
    User-->|Voice (Phone)| Vapi[Vapi.ai Switchboard]
    Vapi-->|System Prompt Injection| LLM[Google Gemini/GPT Engine]
    
    UserChat[Evaluator via Chat Interface] -->|Send Message| Next[Next.js App Router]
    Next -->|Stream Result| LLM
    
    LLM -->|RAG Grounding| DB[(knowledge.md:\nResume & Github READMEs)]
    LLM -->|Serverless Function Call / webhook| Cal[Cal.com V2 Booking API]
```

## ✨ Features
1. **Live Chat Persona**: A Next.js 14 based chat UI integrated with Vercel AI SDK. Grounded strictly on real resume and GitHub data.
2. **AI Voice Agent**: Ultra-low latency voice agent via Vapi.ai capable of natural interruptions.
3. **Automated Scheduling**: Book an interview via Chat or Voice effortlessly without human intervention thanks to the Cal.com native tool calls.
4. **Resilient Knowledge Base**: Uses direct in-prompt Document injection for 0% abstraction loss and maximum retrieval accuracy compared to chunking Vector DBs.

## 🚀 Setup Instructions

1. Clone the repository to your local machine.
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Populate an `.env.local` file at the root of the project with:
   ```bash
   CAL_API_KEY="your_api_key_here"
   GOOGLE_GENERATIVE_AI_API_KEY="your_google_key_here"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
