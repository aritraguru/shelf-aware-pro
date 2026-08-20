import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { message, distributorId } = await request.json();

  let parsed = {
    intent: 'unknown',
    sentiment: 'neutral',
    responseText: "I'm having trouble processing that right now.",
    newDemand: null as number | null
  };

  try {
    // 1. Parse Intent using Gemini 1.5 Flash
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
}`
          }]
        },
        contents: [
          { role: "user", parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    const geminiData = await geminiRes.json();
    if (geminiData.error) {
      console.error("Gemini Error Response:", geminiData.error);
    }
    
    if (geminiData.candidates && geminiData.candidates[0]) {
      const content = geminiData.candidates[0].content.parts[0].text.trim();
      parsed = JSON.parse(content);
    }
  } catch (err) {
    console.error("Gemini API Error:", err);
  }

  const { intent, sentiment, responseText, newDemand } = parsed;

  // 2. Perform Database Updates if applicable
  if (distributorId && intent !== 'unknown') {
    try {
      // Create interaction record
      const { data: interaction } = await supabase
        .from('bot_interactions')
        .insert({
          distributor_id: distributorId,
          proposed_order_json: { source: 'chat_nlp', intent },
          status: intent === 'approve_order' ? 'ACCEPTED' : intent === 'cancel_order' ? 'REJECTED' : 'MODIFIED'
        })
        .select()
        .single();

      // Log to ML feedback loop if rejected or modified
      if (intent === 'cancel_order' || intent === 'modify_demand') {
        await supabase.from('ml_feedback_loop').insert({
          distributor_id: distributorId,
          interaction_id: interaction?.id,
          feedback_type: intent === 'cancel_order' ? 'REJECTION' : 'MODIFICATION',
          distributor_input: message,
          original_forecast: newDemand ? { newDemand } : {}
        });
      }

      // If approved or modified, we simulate the restock by adding to current_inventory of the first SKU
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
        }
      }
    } catch (dbError) {
      console.error("DB Update Error:", dbError);
    }
  }

  return NextResponse.json({
    intent,
    sentiment,
    message: responseText,
    actionPayload: newDemand ? { newDemand } : null
  });
}
