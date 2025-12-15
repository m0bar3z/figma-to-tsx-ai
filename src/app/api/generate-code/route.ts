import { NextResponse } from "next/server";

const DEFAULT_MODEL = "openai/gpt-4o";

export async function POST(req: Request) {
  const { figmaJson, model } = await req.json();
  const selectedModel = model || DEFAULT_MODEL;

  const prompt = `Convert this Figma JSON to a React TS component with Tailwind v4 classes. Output only the code:\n${JSON.stringify(figmaJson, null, 2)}`;

  try {
    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: selectedModel,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`HF API error: ${res.statusText}`);
    }

    const data = await res.json();

    let code = data.choices[0].message.content.trim();

    const lines = code.split("\n");
    if (lines[0].startsWith("```") && lines[lines.length - 1] === "```") {
      code = lines.slice(1, -1).join("\n").trim();
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error("HF API error:", error);
    return NextResponse.json({ error: "HF API failed (check free tier limits or response format)" }, { status: 500 });
  }
}
