import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST(req: NextRequest) {
  try {
    const { template } = await req.json();
    if (!template || typeof template !== "string") {
      return NextResponse.json(
        { error: "Missing template name" },
        { status: 400 }
      );
    }

    const scriptPath = path.join(PROJECT_ROOT, "scripts", "select-template.sh");
    const { stdout, stderr } = await execFileAsync("bash", [scriptPath, template], {
      cwd: PROJECT_ROOT,
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      ...(stderr ? { warnings: stderr } : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
