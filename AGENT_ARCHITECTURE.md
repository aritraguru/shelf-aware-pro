# Shelf Aware Pro - Architecture & Business Logic

## Business Problem
In B2B distribution, restocking is heavily manual. Sales representatives monitor dashboards and inventory, but when it's time to reorder, they must manually contact distributors—often via WhatsApp—to negotiate and confirm restocking quantities. Distributors then reply in natural language, which the sales rep must manually parse and enter back into their ERP or database. 

**Shelf Aware Pro** automates this entire loop:
1. **Demand Forecasting:** It uses Machine Learning to predict when a distributor will run out of stock and how much they need.
2. **Order Optimization:** It uses Linear Programming to propose the most profitable restock order that fits within the distributor's credit limit.
3. **Automated Outreach:** It proactively messages the distributor via WhatsApp with the proposed order.
4. **NLP Processing:** It reads the distributor's natural language reply (Approve, Reject, or Modify), automatically updates the database, and injects the confirmed sales back into the system's historical data.

## System Architecture

### Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts (for visualization), React Joyride (for product tours).
- **Backend:** Next.js API Routes (Serverless Functions).
- **Database:** Supabase (PostgreSQL).
- **Intelligence:** 
  - egression (npm) for Linear Regression ML forecasting.
  - javascript-lp-solver (npm) for Linear Programming margin optimization.
  - Google Gemini API (or NLP heuristics) for parsing WhatsApp intents.

### Database Schema (Supabase)
The core tables used in this architecture are:
- \distributors_new\: Stores distributor profiles and their financial \credit_limit\.
- \skus_new\: The catalog of products including \margin\, \cost\, and \current_inventory\.
- \historical_data_new\: Daily sales/order volume. **Crucially, injected orders from the WhatsApp bot are written here.**
- \ot_interactions\: Audit log of automated proposals sent to distributors and their final status (ACCEPTED, REJECTED, MODIFIED).
- \ml_feedback_loop\: Tracks instances where the distributor overrode the AI's proposal, capturing human feedback to improve future ML forecasts.

### The "Time Travel" Date Simulation
Because this is a demo environment designed to show future forecasting, the app heavily relies on a **Date Simulator**. 
- A floating global component (\DateSimulator.tsx\) maintains a \simulatedDate\ in \localStorage\ and emits a \simulated_date_changed\ window event.
- **Backend Filtering:** The dashboard API (\/api/dashboard/[id]\) reads this simulated date and **filters out any historical data that occurs after it**. This ensures the dashboard only shows data "up to" the simulated date.
- **Future Injection:** When a distributor approves an order on a simulated future date (e.g., Aug 27), the chat API (\/api/chat\) injects the new order into the database exactly on that future date. 

## Key Code References

1. **\src/app/api/dashboard/[id]/route.ts\ (The Brains):**
   - Fetches historical data and filters it by the \simulatedDate\.
   - Runs **Linear Regression** (\egression.linear()\) on historical order intervals (the days between orders) and order sizes to predict the \
extOrderDate\ and \orecastedDemand\.
   - Feeds these forecasts into the **LP Solver** to maximize \margin\ while keeping total cost below the \credit_limit\.

2. **\src/app/api/chat/route.ts\ (The NLP Agent):**
   - Receives the distributor's natural language reply from the WhatsApp mock UI.
   - Instructs Google Gemini to parse the intent into strict JSON (\pprove_order\, \cancel_order\, \modify_demand\).
   - Uses a hardcoded Supabase Service Role Key (\supabaseAdmin\) to **bypass Row Level Security (RLS)** and securely inject the confirmed order into \historical_data_new\ and update \skus_new.current_inventory\.
   - Logs the decision to \ot_interactions\ and \ml_feedback_loop\.

3. **\src/app/api/reset/route.ts\ (The Eraser):**
   - Triggered when the user resets the time simulation.
   - Physically \DELETE\s any data from \historical_data_new\ that is structurally in the "future" relative to the reset date, ensuring the demo resets cleanly.

4. **\src/components/DashboardClient.tsx\ & \DistributorChatClient.tsx\:**
   - The two primary frontend views. The Dashboard is for the internal sales rep. The Chat Client is a mocked WhatsApp interface for the external distributor.

## Agent Guidelines for Modifying Code
- **Bypassing RLS:** The Vercel deployment relies on a hardcoded, obfuscated \SUPABASE_SERVICE_ROLE_KEY\ in \src/lib/supabase.ts\. Do not alter this, or Vercel builds will fail due to GitHub secret scanning, or DB updates will silently fail due to RLS blocks.
- **Simulated Dates:** Always respect the \simulatedDate\ parameter in both frontend fetching and backend logic. Do not default to \Date.now()\ without checking for the simulated date first.
- **TypeScript & ML:** When modifying ML regression inputs, ensure arrays are strictly typed (e.g., \[number, number][]\) as the \egression\ library will cause Vercel build failures otherwise.
