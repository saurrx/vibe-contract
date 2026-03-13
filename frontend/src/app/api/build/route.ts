import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST() {
  const scriptPath = path.join(PROJECT_ROOT, "scripts", "build.sh");

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn("bash", [scriptPath], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, FORCE_COLOR: "0" },
      });

      const push = (data: Buffer) => {
        controller.enqueue(data);
      };

      child.stdout.on("data", push);
      child.stderr.on("data", push);

      child.on("close", (code) => {
        if (code !== 0) {
          controller.enqueue(
            Buffer.from(`\nProcess exited with code ${code}\n`)
          );
        }
        controller.close();
      });

      child.on("error", (err) => {
        controller.enqueue(Buffer.from(`ERROR: ${err.message}\n`));
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
