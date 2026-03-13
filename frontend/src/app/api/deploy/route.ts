import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST() {
  try {
    const scriptPath = path.join(PROJECT_ROOT, "scripts", "deploy.sh");
    await execFileAsync("bash", [scriptPath], {
      cwd: PROJECT_ROOT,
      timeout: 120000,
    });

    // Read the program ID from output
    const programIdPath = path.join(PROJECT_ROOT, "output", "program-id.txt");
    let programId = "";
    try {
      programId = (await readFile(programIdPath, "utf-8")).trim();
    } catch {
      // program ID might be embedded in deploy output
    }

    return NextResponse.json({ success: true, programId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Deploy failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
