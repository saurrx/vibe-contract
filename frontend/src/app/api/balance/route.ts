import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function GET() {
  try {
    const keypairPath = path.join(PROJECT_ROOT, "deployer-keypair.json");
    const { stdout } = await execFileAsync("solana", [
      "balance",
      "--keypair",
      keypairPath,
      "--url",
      "devnet",
    ]);
    const balance = stdout.trim().replace(" SOL", "");
    return NextResponse.json({ balance });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check balance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
