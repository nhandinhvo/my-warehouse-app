// supabase/functions/gemini-function-calling/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  console.log("Function invoked."); // Log khi function được gọi

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }});
  }

  try {
    // Lấy và kiểm tra API Key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
      console.error("CRITICAL ERROR: GEMINI_API_KEY secret is not set or empty.");
      return new Response(JSON.stringify({ error: "Server configuration error: API Key is missing." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    console.log("GEMINI_API_KEY is present."); // Log xác nhận có key

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
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
        console.error("Gemini API Error:", errorText); // Log chi tiết lỗi từ Gemini
        throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
    }

    const responseData = await geminiResponse.json();
    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error("Catch block error:", error.message); // Log lỗi trong khối catch
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });
  }
});
