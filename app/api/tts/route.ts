import { NextResponse } from "next/server";

const DEFAULT_FISH_KEY = "sk-fish-6Bj9Xol_DIr29rw7Ctg9KJJT3uZ0QHchuBL6N04-u-s";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { text, voiceId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    // Clean text: strip markdown codeblocks, links, bold tags, and bracketed prompt modifiers
    let cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\*\*.*?\*\*/g, (m) => m.replace(/\*/g, ""))
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: "Cleaned text is empty." }, { status: 400 });
    }

    // Limit to 1000 characters for snappy voice response
    if (cleanText.length > 1000) {
      cleanText = cleanText.slice(0, 997) + "...";
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY || DEFAULT_FISH_KEY;
    const model = process.env.FISH_AUDIO_MODEL || "s2.1-pro-free";
    const refId = voiceId || process.env.FISH_AUDIO_VOICE_ID || undefined;

    const payload: Record<string, any> = {
      text: cleanText,
      format: "mp3",
    };

    if (refId) {
      payload.reference_id = refId;
    }

    const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: model,
      },
      body: JSON.stringify(payload),
    });

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text();
      console.error("Fish Audio API error:", fishResponse.status, errorText);
      return NextResponse.json(
        { error: `Fish Audio error (${fishResponse.status}): ${errorText}` },
        { status: fishResponse.status }
      );
    }

    const audioBuffer = await fishResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("TTS generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate speech." },
      { status: 500 }
    );
  }
}
