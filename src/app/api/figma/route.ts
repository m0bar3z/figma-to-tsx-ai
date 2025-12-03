import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { url, fileKey: providedKey, nodeIds } = body;

  let fileKey = providedKey;
  if (url) {
    try {
      const u = new URL(url);
      const match = u.pathname.match(/\/(?:file|design|proto|fig|community)\/([a-zA-Z0-9]{22})/);
      if (match) fileKey = match[1];
    } catch {}
  }

  if (!fileKey) {
    return NextResponse.json({ error: "Invalid Figma URL or missing fileKey" }, { status: 400 });
  }

  const token = process.env.FIGMA_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing FIGMA_TOKEN" }, { status: 500 });

  let apiUrl = `https://api.figma.com/v1/files/${fileKey}`;
  if (nodeIds && Array.isArray(nodeIds) && nodeIds.length > 0) {
    const ids = nodeIds.map((id: string) => id.replace(/-/g, ":")).join(",");
    apiUrl += `/nodes?ids=${ids}`;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: { "X-Figma-Token": token },
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("Figma error:", data);
      return NextResponse.json({ error: "Figma API error", details: data }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
