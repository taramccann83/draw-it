import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageDataUrl, levelId, levelTitle, levelDescription } = await request.json();

    if (!imageDataUrl || !levelTitle || !levelDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Get AI review from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a warm, encouraging art teacher for kids and beginners of all ages. You are reviewing a drawing that was supposed to be: "${levelDescription}".

Your job:
1. Give a star rating from 1 to 3:
   - 1 star: The drawing doesn't quite match yet, but celebrate the effort
   - 2 stars: Good attempt! You can recognize what it is
   - 3 stars: Great job! It clearly looks like what was asked for
2. Write a fun, encouraging message (1-2 sentences). Always celebrate something specific about their drawing.
3. If the rating is 1 or 2 stars, give ONE specific, friendly tip to improve (1 sentence). If 3 stars, tip can be null.

IMPORTANT: Never be harsh or discouraging. Always find something positive to say. Keep the language simple and friendly — suitable for kids ages 5+.

Respond in this exact JSON format:
{"stars": 1, "message": "Your message here!", "tip": "Your tip here or null"}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please review this drawing. It's supposed to be: ${levelTitle} (${levelDescription})`,
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse response");

    const result = JSON.parse(jsonMatch[0]);
    const stars = Math.min(3, Math.max(1, result.stars));

    // 2. Save to Supabase (best-effort — don't fail the review if DB has issues)
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (user && levelId) {
        // Save/update level progress (keep best star score)
        const { data: existing } = await supabase
          .from("drawit_level_progress")
          .select("id, stars_earned")
          .eq("user_id", user.id)
          .eq("level_id", levelId)
          .single();

        if (existing) {
          // Only update if new score is better
          if (stars > existing.stars_earned) {
            const starDiff = stars - existing.stars_earned;
            await supabase
              .from("drawit_level_progress")
              .update({ stars_earned: stars, completed_at: new Date().toISOString() })
              .eq("id", existing.id);

            // Add only the difference to total_stars
            await supabase.rpc("increment_drawit_stars", {
              p_user_id: user.id,
              p_amount: starDiff,
            });
          }
        } else {
          // First attempt at this level
          await supabase
            .from("drawit_level_progress")
            .insert({ user_id: user.id, level_id: levelId, stars_earned: stars });

          await supabase.rpc("increment_drawit_stars", {
            p_user_id: user.id,
            p_amount: stars,
          });
        }

        // Save drawing PNG to Storage for Gallery
        const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const storagePath = `${user.id}/${levelId}-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("drawings")
          .upload(storagePath, buffer, { contentType: "image/png" });

        if (!uploadError) {
          await supabase.from("drawit_drawings").insert({
            user_id: user.id,
            level_id: levelId,
            storage_path: storagePath,
            stars,
          });
        }
      }
    } catch (dbError) {
      // Log but don't fail — the AI review still returns to the user
      console.error("DB save error:", dbError);
    }

    return NextResponse.json({
      stars,
      message: result.message,
      tip: result.tip || null,
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      {
        stars: 1,
        message: "Great effort! Keep practicing and you'll get even better!",
        tip: null,
      },
      { status: 200 }
    );
  }
}
