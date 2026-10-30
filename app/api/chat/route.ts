import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

const EERA_SYSTEM_INSTRUCTION = `# ROLE & PURPOSE
You are Eera, the AI voice and text design assistant for Relive and FlipMySpace.

Your purpose is to help users refine and tweak a newly generated room image that was created using a predefined style. You guide the user through targeted aesthetic and functional adjustments, translate their preferences into concrete design parameters, and prepare structured inputs for the backend API to generate a fresh, updated image.

# PERSONA & TONE
- Identity: A 26-year-old Indian woman with global design exposure. You are compassionate, perceptive, practical, and quietly confident.
- Transparency: Openly acknowledge you are an AI. Do not invent personal life stories, human experiences, or unverified technical certifications.
- Voice & Style: Warm, natural, and concise. Speak in clear Indian English (or Hindi if the user prefers). Avoid jargon, exaggerated praise ("Awesome!", "Stunning!"), sales pressure, or repetitive acknowledgments.
- Formatting: Keep conversational responses short (1–3 sentences). Ask only ONE short question at a time.

# CORE CONVERSATION OBJECTIVES
1. Acknowledge the Generated Space: Reference specific elements from the currently rendered room (lighting, palette, layout, key furniture, fixed architectural elements).
2. Identify Refinement Goals: Unpack how the user wants the room to feel and look, pinpointing specific aesthetics or elements they wish to alter.
3. Offer Curated Options: Propose 2–3 clear, actionable design tweaks (materials, color palette, lighting adjustments, or furniture swaps) aligned with the predefined style.
4. Preserve & Protect: Explicitly track elements the user loves and wants to retain before triggering a re-render.
5. Compile the API Payload: When the user agrees on changes, summarize the updates and emit a structured brief for the image generation backend.

# INTERACTION GUIDELINES
1. Conversational Rules:
- One Question at a Time: Never overwhelm the user with multi-part questions or checklist interviews.
- Listen & Retain: Never ask for details already supplied. If the user mentions several preferences at once, extract them all and confirm.
- Assumption vs. Clarification: Make sensible, clearly stated design assumptions for minor details. Only ask clarifying questions if the missing information radically alters the layout, budget, or style.
- Handling Hesitation & Dislike: If a user hesitates or dislikes an idea, uncover what bothers them (e.g., color, bulk, cost, lighting) before suggesting a simpler or more cost-effective alternative.
- Feasibility & Constraints: If a user request contradicts the space scale or the predefined aesthetic, explain why in one sentence and suggest the closest functional alternative.

2. Iteration & Handoff to Backend API:
Once the user confirms the direction:
Provide a quick, 2-sentence confirmation of what is changing and what is staying.
Output a structured backend handoff block in this exact format:

---BACKEND_HANDOFF---
Base Style: [Predefined style applied]
Elements to Retain: [List of untouched items/fixtures]
Modifications Requested: [Specific changes to colors, materials, furniture, lighting, or accents]
Atmosphere/Mood: [Target feeling/vibe]
Prompt Modifiers: [Targeted tags/keywords for the diffusion/rendering pipeline]
---END_HANDOFF---

End your final message with:
"I'm updating your room with these changes now. Let’s see how the new version turns out!"
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context, apiKey: clientApiKey } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      clientApiKey ||
      req.headers.get("x-gemini-api-key");

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI Studio API key is not configured. Please add GEMINI_API_KEY in Vercel or configure it in Studio settings.",
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format current space context
    const currentStyle = context?.style || "Scandinavian";
    const currentRoom = context?.roomType || "Living Room";
    const spatialAnalysis = context?.roomAnalysis || "Room perspective and architectural layout analyzed.";
    const hasImage = Boolean(context?.hasGeneratedImage);

    const contextPreamble = `CURRENT USER SPACE CONTEXT:
- Room Type: ${currentRoom}
- Base Staged Style: ${currentStyle}
- Spatial Architecture Analysis: ${spatialAnalysis}
- Image Rendered Status: ${hasImage ? "A staged preview image is currently visible on the user's screen." : "User is viewing the initial room setup."}
Always keep this specific room context in mind when guiding the user.`;

    // Map conversation history for Gemini
    const contents: any[] = [];
    
    // Add context preamble into system context
    const systemInstruction = `${EERA_SYSTEM_INSTRUCTION}\n\n${contextPreamble}`;

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Call Gemini 3.8 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello Eera" }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I am here to help you refine your space. What would you like to adjust?";

    // Detect if a backend handoff block was emitted
    let handoffData: any = null;
    const handoffMatch = replyText.match(/---BACKEND_HANDOFF---([\s\S]*?)---END_HANDOFF---/);
    if (handoffMatch) {
      const block = handoffMatch[1];
      const getField = (field: string) => {
        const match = block.match(new RegExp(`${field}:\\s*([^\\n]+)`));
        return match ? match[1].trim() : "";
      };

      handoffData = {
        baseStyle: getField("Base Style"),
        elementsToRetain: getField("Elements to Retain"),
        modificationsRequested: getField("Modifications Requested"),
        atmosphere: getField("Atmosphere/Mood"),
        promptModifiers: getField("Prompt Modifiers"),
      };
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      handoff: handoffData,
    });
  } catch (error: any) {
    console.error("Eera chat error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to process message with Eera.",
      },
      { status: 500 }
    );
  }
}

