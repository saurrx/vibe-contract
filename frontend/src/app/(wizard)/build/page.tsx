"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuildPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!building) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [building]);

  const handleBuild = async () => {
    setBuilding(true);
    setSuccess(null);
    setLogs([]);
    setElapsed(0);

    try {
      const res = await fetch("/api/build", { method: "POST" });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter(Boolean);
        setLogs((prev) => [...prev, ...lines]);
      }

      // Check last few lines for success indicators
      const allLogs = logs.join("\n");
      setSuccess(!allLogs.includes("error[") && !allLogs.includes("Build failed"));
    } catch {
      setLogs((prev) => [...prev, "ERROR: Build failed unexpectedly"]);
      setSuccess(false);
    } finally {
      setBuilding(false);
    }
  };

  // Detect success from log content
  useEffect(() => {
    if (!building && logs.length > 0 && success === null) {
      const combined = logs.join("\n");
      if (combined.includes("Build succeeded") || combined.includes("Finished")) {
        setSuccess(true);
      } else if (combined.includes("error[") || combined.includes("Build failed")) {
        setSuccess(false);
      } else {
        setSuccess(true); // Default to success if no error indicators
      }
    }
  }, [building, logs, success]);

  const getLineColor = (line: string) => {
    if (line.startsWith("ERROR") || line.includes("error[")) return "text-red-400";
    if (line.startsWith("warning") || line.includes("warning:")) return "text-amber-400/70";
    if (line.includes("Compiling")) return "text-neon-cyan/50";
    if (line.includes("Finished") || line.includes("Build succeeded") || line.includes("\u2705")) return "text-solana-green";
    return "text-foreground/60";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-solana-purple/50 uppercase mb-2">
            STEP 03 // BUILD
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Compile <span className="gradient-text">on-chain</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anchor build &mdash; compiles Rust to BPF bytecode
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/code")}
            className="rounded-lg border border-solana-purple/15 bg-transparent px-4 py-2 font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground hover:border-solana-purple/25 transition-all"
          >
            \u2190 BACK
          </button>
          {success && (
            <button
              onClick={() => router.push("/deploy")}
              className="rounded-lg bg-solana-green/15 border border-solana-green/25 px-5 py-2 font-mono text-xs tracking-wider text-solana-green hover:bg-solana-green/20 transition-all"
            >
              DEPLOY \u2192
            </button>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div className={`terminal-chrome relative ${building ? "forge-pulse" : ""}`}>
        <div className="terminal-bar">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground/50">
            anchor build
          </span>
          <div className="flex-1" />
          {building && (
            <span className="font-mono text-[10px] text-solana-purple/60 animate-pulse">
              {elapsed}s
            </span>
          )}
          {success !== null && (
            <span
              className={`font-mono text-[10px] font-semibold tracking-wider ${
                success ? "text-solana-green" : "text-red-400"
              }`}
            >
              {success ? "\u2588 BUILD OK" : "\u2588 BUILD FAILED"}
            </span>
          )}
        </div>

        <div className="max-h-[55vh] min-h-[300px] overflow-auto terminal-scroll p-4 font-mono text-[12px] leading-5">
          {logs.length === 0 && !building && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-3xl text-muted-foreground/20">{">>>"}</div>
              <p className="text-muted-foreground/40 text-sm">
                Ready to compile
              </p>
            </div>
          )}
          {logs.map((line, i) => (
            <div key={i} className={`${getLineColor(line)} leading-5`}>
              {line}
            </div>
          ))}
          {building && (
            <span className="inline-block w-2 h-4 bg-solana-purple animate-pulse" />
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Action buttons */}
      {!building && success === null && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBuild}
            className="neon-button rounded-xl px-10 py-3 font-mono text-sm tracking-wider"
          >
            START BUILD
          </button>
        </div>
      )}

      {!building && success === false && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBuild}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-8 py-3 font-mono text-sm tracking-wider text-red-400 hover:bg-red-500/15 transition-all"
          >
            RETRY BUILD
          </button>
        </div>
      )}
    </div>
  );
}
