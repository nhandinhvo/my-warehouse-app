// supabase/functions/gemini-function-calling/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }});
  }

  try {
    const { prompt, tools } = await req.json();
    const geminiRequestBody = {
      contents: [{ parts: [{ "text": prompt }] }],
      tools: tools
    };

    const geminiResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiRequestBody),
    });

    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
    }

    const responseData = await geminiResponse.json();

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
       },
    });
  }
});