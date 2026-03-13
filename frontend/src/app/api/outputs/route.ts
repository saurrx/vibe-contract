import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "output");

async function safeRead(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const [programId, idl, clientSnippet, readme] = await Promise.all([
      safeRead(path.join(OUTPUT_DIR, "program-id.txt")),
      safeRead(path.join(OUTPUT_DIR, "idl.json")),
      safeRead(path.join(OUTPUT_DIR, "client-snippet.ts")),
      safeRead(path.join(OUTPUT_DIR, "program-readme.md")),
    ]);

    if (!programId) {
      return NextResponse.json(
        { error: "No outputs found. Deploy your program first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      programId: programId.trim(),
      idl,
      clientSnippet,
      readme,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read outputs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
