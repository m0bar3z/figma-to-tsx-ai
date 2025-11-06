import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { figmaJson } = await req.json();
  const prompt = `Convert this Figma JSON to a React TS component with Tailwind v4 classes. Output only the code:\n${JSON.stringify(figmaJson, null, 2)}`;

  console.log("sdfsdf", prompt);

  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-20b',
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`HF API error: ${res.statusText}`);
    }

    const data = await res.json();

    let code = data.choices[0].message.content.trim();

    const lines = code.split('\n');
    if (lines[0].startsWith('```') && lines[lines.length - 1] === '```') {
      code = lines.slice(1, -1).join('\n').trim();
    }

    return NextResponse.json({ code });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("HF API error:", error);
    return NextResponse.json({ error: 'HF API failed (check free tier limits or response format)' }, { status: 500 });
  }
}