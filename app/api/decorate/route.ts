import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Allow sufficient time for multimodal AI staging

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      style,
      roomType,
      refinementNotes,
      promptModifiers,
      elementsToRetain,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required. Please upload an image of your room." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      body.apiKey ||
      req.headers.get("x-gemini-api-key");

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI Studio API key is not configured on the server. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, or enter your API key in the Staging Studio settings.",
          isApiKeyMissing: true,
        },
        { status: 401 }
      );
    }

    // Extract raw base64 and mime type from data URI
    let cleanBase64 = imageBase64;
    let mimeType = "image/jpeg";
    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      cleanBase64 = dataUrlMatch[2];
    }

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });

    const selectedStyle = style || "Modern Minimalist";
    const selectedRoom = roomType || "Living Room";

    // Step 1: True Spatial & Geometric Analysis of the User's Actual Uploaded Photo
    const analysisPrompt = `You are an expert interior architect and virtual staging specialist.
Analyze this exact uploaded photo of an empty room.
Identify and describe:
1. The exact camera perspective, horizon line, and field of view.
2. The floor plane boundaries, wall positions, ceiling lines, and window/door openings.
3. The natural lighting direction and ambient shadows.
4. The exact placement coordinates where furniture should be added to stage this space as a ${selectedStyle} ${selectedRoom} without altering or warping any walls, floors, or windows.
Respond in 2-3 concise architectural sentences.`;

    let roomAnalysis = "Perspective and floor geometry detected from uploaded room photo.";

    try {
      const analysisResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          analysisPrompt,
        ],
      });

      if (analysisResponse.text) {
        roomAnalysis = analysisResponse.text.trim();
      }
    } catch (analysisErr: any) {
      console.warn("Gemini spatial analysis error:", analysisErr.message || analysisErr);
    }

    // Step 2: Direct Image-to-Image Staging with Google GenAI
    // We pass the user's actual image inlineData directly to Google's image model
    let stagingPrompt = `You are a professional architectural virtual staging engine.
Take this EXACT input photo of an empty room and stage it with ${selectedStyle} interior decor for a ${selectedRoom}.

STRICT ARCHITECTURAL CONSTRAINTS:
- Use this uploaded room image as the exact foundation.
- Keep the exact walls, flooring material and perspective, window frames, door locations, and ceiling height from this input image completely unchanged.
- Seamlessly place authentic ${selectedStyle} furniture into the empty floor space: sofa/seating, coffee table, area rug, lighting, indoor plants, and wall decor that match the perspective and natural light of the uploaded room.
- Photorealistic 8K, architectural digest standard, perfect perspective alignment.`;

    if (elementsToRetain) {
      stagingPrompt += `\n- PRESERVED ELEMENTS (DO NOT ALTER): ${elementsToRetain}`;
    }
    if (refinementNotes) {
      stagingPrompt += `\n- TARGETED USER REFINEMENTS: ${refinementNotes}`;
    }
    if (promptModifiers) {
      stagingPrompt += `\n- TARGET AESTHETIC MODIFIERS: ${promptModifiers}`;
    }

    let stagedImageBase64: string | null = null;
    let googleErrorMessage: string | null = null;

    // Supported Google image-to-image models in order of fidelity
    const imageModels = [
      "gemini-3.1-flash-image",
      "gemini-2.5-flash-image",
      "gemini-3-pro-image",
      "gemini-3.1-flash-lite-image"
    ];

    for (const modelName of imageModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            stagingPrompt,
          ],
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData?.data) {
            const outType = p.inlineData.mimeType || "image/jpeg";
            stagedImageBase64 = `data:${outType};base64,${p.inlineData.data}`;
            break;
          }
        }

        if (stagedImageBase64) {
          break; // Successfully generated with Google API!
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`Google image staging with ${modelName} failed:`, msg);
        if (msg.includes("limit: 0") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED")) {
          googleErrorMessage = "Google Free Tier Quota Limit: Google AI Studio restricts image generation models to 0 requests on free-tier projects without linked billing.";
        } else {
          googleErrorMessage = msg;
        }
      }
    }

    // If Google API successfully returned the staged image, return it
    if (stagedImageBase64) {
      return NextResponse.json({
        success: true,
        imageUrl: stagedImageBase64,
        analysis: roomAnalysis,
        engine: "Google GenAI Direct Image-to-Image",
      });
    }

    // If Google API was blocked by quota (limit: 0 on free tier)
    // We provide full transparent explanation so the user knows exactly what Google API requires
    return NextResponse.json(
      {
        error: googleErrorMessage || "Google GenAI image staging models are currently unavailable.",
        isQuotaError: true,
        analysis: roomAnalysis,
        helpMessage:
          "Google AI Studio allows spatial vision analysis, but assigns a 0-quota limit (limit: 0) to image-generation models unless Pay-As-You-Go billing is enabled on your project.",
        billingUrl: "https://ai.google.dev/gemini-api/docs/rate-limits",
      },
      { status: 429 }
    );
  } catch (error: any) {
    console.error("Interior decor generation error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An unexpected error occurred while processing your room photo.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasServerKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
  );
  const keyPrefix = hasServerKey
    ? `${process.env.GEMINI_API_KEY!.slice(0, 5)}...${process.env.GEMINI_API_KEY!.slice(-4)}`
    : null;

  return NextResponse.json({
    status: "ok",
    hasServerKey,
    keyPrefix,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  });
}
