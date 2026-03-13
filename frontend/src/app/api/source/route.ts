import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function GET() {
  try {
    const filePath = path.join(
      PROJECT_ROOT,
      "programs",
      "active-program",
      "src",
      "lib.rs"
    );
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return NextResponse.json(
      { error: "Source file not found" },
      { status: 404 }
    );
  }
}
