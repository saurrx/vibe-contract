import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST() {
  try {
    const keypairPath = path.join(PROJECT_ROOT, "deployer-keypair.json");
    const { stdout } = await execFileAsync("solana", [
      "airdrop",
      "2",
      "--keypair",
      keypairPath,
      "--url",
      "devnet",
    ]);
    return NextResponse.json({ success: true, output: stdout.trim() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Airdrop failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
