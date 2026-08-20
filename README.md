# Shelf Aware Pro (V2)

An AI-driven inventory optimization and B2B ordering platform. 

This repository leverages Next.js 15, Tailwind v4, Supabase, and Gemini 3.5 Flash. It actively monitors distributor inventory using MILP optimization algorithms and proactively messages distributors via a WhatsApp-style web interface to restock before they run out.

## AI Agent Context
**Teammates using Cursor, Windsurf, Aider, or other autonomous coding tools:**  
This repository contains a `.cursorrules` file at the root. Please ensure your AI agent reads it before modifying the architecture. It details our V2 pivot (Distributor-led WhatsApp ordering over Sales-Rep-led dashboarding), our Supabase schema expectations, and how the Gemini NLP parsing loop operates.

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Run the development server (uses Turbopack by default):
   ```bash
   npm run dev
   ```

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
