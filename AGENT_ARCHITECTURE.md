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
  - \egression\ (npm) for Linear Regression ML forecasting.
  - \javascript-lp-solver\ (npm) for Linear Programming margin optimization.
  - Google Gemini API (or NLP heuristics) for parsing WhatsApp intents.

### Database Schema & Seed Data (Supabase)
We seeded exactly **30 days of historical data** for each SKU across all distributors. 
- The data is designed to mimic a B2B "burst" pattern. Instead of a few sales every day, orders occur approximately once every 7 days, with slight randomization in quantity and interval. 
- \distributors_new\: Stores distributor profiles and their financial \credit_limit\.
- \skus_new\: The catalog of products including \margin\, \cost\, and \current_inventory\.
- \historical_data_new\: Daily sales/order volume. **Crucially, injected orders from the WhatsApp bot are written here.**
- \ot_interactions\ & \ml_feedback_loop\: Tracks the automated proposals and any overrides from the distributor, allowing the system to learn from human feedback over time.

### The Forecastor (Linear Regression)
The forecaster uses the \egression\ library to run a basic **Linear Regression** model over the historical burst data. 
- **Robustness:** It is currently a simple linear model designed specifically for the demo. It expects linear trends and extracts the average interval and size between the past order bursts to predict the \
extOrderDate\ and \orecastedDemand\.
- **Feedback Loop:** As soon as a new order is injected (e.g. from the WhatsApp chat), it is added to the historical data, and the regression model dynamically re-runs to predict the next future date based on the newly formed interval.

### Order Optimization (Linear Programming)
We explicitly use the \javascript-lp-solver\ library to optimize the proposed order. 
- **Objective:** Maximize total \margin\.
- **Variables:** The demand for each SKU, bounded by the ML's \orecastedDemand\.
- **Constraints:** The total cost of the order cannot exceed the distributor's \credit_limit\.
This ensures that the AI's proposal is not only timed perfectly but mathematically optimized for maximum profit under strict financial constraints.

### The "Time Travel" Date Simulation
Because this is a demo environment designed to show future forecasting, the app heavily relies on a **Date Simulator**. 
- A floating global component (\DateSimulator.tsx\) maintains a \simulatedDate\ in \localStorage\ and emits a \simulated_date_changed\ window event.
- **Backend Filtering:** The dashboard API (\/api/dashboard/[id]\) reads this simulated date and **filters out any historical data that occurs after it**. This ensures the dashboard only shows data "up to" the simulated date.
- **Future Injection:** When a distributor approves an order on a simulated future date (e.g., Aug 27), the chat API (\/api/chat\) injects the new order into the database exactly on that future date. 

## The Core Business Process Flow (Demo Tutorial)
The app includes a guided tour that steps the user through the exact business process. Agents should take inspiration from this exact loop:

1. **Dashboard Overview:** The internal sales rep reviews the distributor's dashboard, checking 30-day historical consumption patterns (the burst data).
2. **Review ML Prediction:** The rep notices the 'Next Predicted Order' date—the exact date the Linear Regression model predicts a stockout.
3. **Time Simulation (Fast Forward):** The rep clicks "Skip to {Forecast Date}" in the simulator to jump to the future.
4. **Automated WhatsApp Trigger:** By hitting the predicted stockout date, the backend LP Solver automatically formulates an optimal order and sends it to the Distributor View (WhatsApp mockup) without the rep lifting a finger.
5. **NLP Approval:** The distributor replies "Yes" (or modifies the quantity) in the chat. Gemini 1.5 Pro parses this intent.
6. **Database Injection & Re-prediction:** The intent is processed via the backend, and the order is injected into the database on the simulated date. When the rep returns to the dashboard, they see the graph spike with the new order, and the ML model immediately recalculates a brand new future forecast date.

## Agent Guidelines for Modifying Code
- **Bypassing RLS:** The Vercel deployment relies on a hardcoded, obfuscated \SUPABASE_SERVICE_ROLE_KEY\ in \src/lib/supabase.ts\. Do not alter this, or Vercel builds will fail due to GitHub secret scanning, or DB updates will silently fail due to RLS blocks.
- **Simulated Dates:** Always respect the \simulatedDate\ parameter in both frontend fetching and backend logic. Do not default to \Date.now()\ without checking for the simulated date first.
- **TypeScript & ML:** When modifying ML regression inputs, ensure arrays are strictly typed (e.g., \[number, number][]\) as the \egression\ library will cause Vercel build failures otherwise.
