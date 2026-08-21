import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function parseHeuristic(message: string) {
  const lower = message.toLowerCase().trim();
  
  // 1. Approve
  if (lower.includes('yes') || lower.includes('approve') || lower.includes('confirm') || lower.includes('ok') || lower.includes('sure') || lower.includes('sounds good') || lower.includes('accept')) {
    return {
      intent: 'approve_order',
      sentiment: 'positive',
      responseText: "Thanks! Your restock order has been approved and logged into our fulfillment queue. Delivery scheduled within 48 hours.",
      newDemand: null
    };
  }

  // 2. Cancel
  if (lower.includes('no') || lower.includes('cancel') || lower.includes('decline') || lower.includes('reject') || lower.includes('not now') || lower.includes('stop')) {
    return {
      intent: 'cancel_order',
      sentiment: 'critical',
      responseText: "Understood. The proposed restock order has been cancelled and put on hold.",
      newDemand: null
    };
  }

  // 3. Modify demand
  const numberMatch = message.match(/\b\d+\b/);
  if (numberMatch && (lower.includes('change') || lower.includes('modify') || lower.includes('take') || lower.includes('need') || lower.includes('want') || lower.includes('to') || lower.includes('make it') || lower.includes('only'))) {
    const qty = parseInt(numberMatch[0], 10);
    return {
      intent: 'modify_demand',
      sentiment: 'neutral',
      responseText: `Got it! We've adjusted your order quantity to ${qty} units. The revised order has been registered.`,
      newDemand: qty
    };
  }

  return {
    intent: 'unknown',
    sentiment: 'neutral',
    responseText: "I received your message. You can reply 'Yes' to approve the restock, 'No' to cancel, or specify adjustments (e.g. 'change quantity to 50').",
    newDemand: null
  };
}

export async function POST(request: Request) {
  let message = "";
  let distributorId: any = 1;
  let language = "en";
  let simulatedDate: string | null = null;

  try {
    const body = await request.json();
    message = body.message || "";
    distributorId = body.distributorId || 1;
    if (body.language) language = body.language;
    if (body.simulatedDate) simulatedDate = body.simulatedDate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  let parsed = parseHeuristic(message);

  // Attempt Gemini API if key is present
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (GEMINI_KEY && GEMINI_KEY !== 'your_gemini_api_key') {
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are an AI order intent parser for a B2B dashboard. The user is a distributor responding to an automated restock proposal on WhatsApp.
Return ONLY valid JSON matching this exact schema:
{
  "intent": "approve_order" | "cancel_order" | "modify_demand" | "unknown",
  "sentiment": "positive" | "critical" | "neutral",
  "responseText": "A brief, polite, human-like confirmation message to send back to the user.",
  "newDemand": null // ONLY if intent is modify_demand, extract and put the requested numerical quantity here. Otherwise null.
}

CRITICAL: Translate the 'responseText' into the language code '${language}'. If '${language}' is 'en', use English. If it is 'hi', use Hindi. If 'gu' use Gujarati, 'bn' use Bengali, 'ta' use Tamil, 'te' use Telugu. 
DO NOT translate any product or SKU names. Keep numerical quantities in standard digits.`
            }]
          },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
        parsed = JSON.parse(geminiData.candidates[0].content.parts[0].text.trim());
      }
    } catch (err) {
      console.warn("Gemini API fallback to heuristic parser:", err);
    }
  }

  const { intent, sentiment, responseText, newDemand } = parsed;

  // Perform Supabase DB updates if configured
  if (isSupabaseConfigured && distributorId && intent !== 'unknown') {
    try {
      const { data: interaction } = await supabase
        .from('bot_interactions')
        .insert({
          distributor_id: distributorId,
          proposed_order_json: { source: 'chat_nlp', intent },
          status: intent === 'approve_order' ? 'ACCEPTED' : intent === 'cancel_order' ? 'REJECTED' : 'MODIFIED'
        })
        .select()
        .single();

      if (intent === 'cancel_order' || intent === 'modify_demand') {
        await supabase.from('ml_feedback_loop').insert({
          distributor_id: distributorId,
          interaction_id: interaction?.id,
          feedback_type: intent === 'cancel_order' ? 'REJECTION' : 'MODIFICATION',
          distributor_input: message,
          original_forecast: newDemand ? { newDemand } : {}
        });
      }

      if (intent === 'approve_order' || intent === 'modify_demand') {
        const { data: skus } = await supabase
          .from('skus_new')
          .select('*')
          .eq('distributor_id', distributorId)
          .limit(1);

        if (skus && skus.length > 0) {
          const targetSku = skus[0];
          const qtyToAdd = intent === 'modify_demand' && newDemand !== null ? newDemand : 100;
          await supabase
            .from('skus_new')
            .update({ current_inventory: (targetSku.current_inventory || 0) + qtyToAdd })
            .eq('id', targetSku.id);
            
          // Add this order to the historical graph data
          let orderDate = new Date();
          if (simulatedDate) {
            const parsed = new Date(simulatedDate);
            if (!isNaN(parsed.getTime())) orderDate = parsed;
          }
          
          const yyyy = orderDate.getFullYear();
          const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
          const dd = String(orderDate.getDate()).padStart(2, '0');
          const localDateStr = `${yyyy}-${mm}-${dd}`;
          
          await supabase
            .from('historical_data_new')
            .insert({
              sku_id: targetSku.id,
              date: localDateStr,
              units_sold: qtyToAdd
            });
        }
      }
    } catch (dbError) {
      console.warn("DB update skipped:", dbError);
    }
  }

  return NextResponse.json({
    intent,
    sentiment,
    message: responseText,
    actionPayload: newDemand ? { newDemand } : null
  });
}
