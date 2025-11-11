import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export async function POST(req: Request) {
  const { projectName, componentName, code } = await req.json();

  const dirPath = path.join(process.cwd(), "generated", projectName);

  const filePath = path.join(dirPath, `${componentName}.tsx`);

  try {
    await fs.ensureDir(dirPath);

    await fs.writeFile(filePath, code);

    return NextResponse.json({ message: "Component saved" });
  } catch {
    return NextResponse.json({ error: "Component save failed" }, { status: 500 });
  }
}
