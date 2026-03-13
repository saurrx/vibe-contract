"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Highlight, themes } from "prism-react-renderer";
import CopyButton from "@/components/shared/CopyButton";

export default function CodePage() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/source")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load source");
        return res.text();
      })
      .then(setCode)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const lineCount = code.split("\n").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-solana-purple/50 uppercase mb-2">
            STEP 02 // REVIEW
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Inspect the <span className="gradient-text">source</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only preview &mdash; {lineCount} lines of Anchor Rust
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/templates")}
            className="rounded-lg border border-solana-purple/15 bg-transparent px-4 py-2 font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground hover:border-solana-purple/25 transition-all"
          >
            \u2190 BACK
          </button>
          <button
            onClick={() => router.push("/build")}
            className="neon-button rounded-lg px-5 py-2 font-mono text-xs tracking-wider"
          >
            BUILD \u2192
          </button>
        </div>
      </div>

      {/* Code viewer */}
      <div className="terminal-chrome scan-lines relative">
        <div className="terminal-bar">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground/50">
            programs/active-program/src/lib.rs
          </span>
          <div className="flex-1" />
          {code && <CopyButton text={code} />}
        </div>

        <div className="max-h-[65vh] overflow-auto terminal-scroll p-0 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-solana-purple border-t-transparent" />
                <span className="font-mono text-xs text-muted-foreground/50">
                  LOADING SOURCE...
                </span>
              </div>
            </div>
          ) : error ? (
            <p className="py-24 text-center text-destructive font-mono text-sm">
              ERROR: {error}
            </p>
          ) : (
            <Highlight
              theme={themes.nightOwl}
              code={code}
              language="rust"
            >
              {({ tokens, getLineProps, getTokenProps }) => (
                <pre className="text-[13px] leading-6 py-4">
                  {tokens.map((line, i) => (
                    <div
                      key={i}
                      {...getLineProps({ line })}
                      className="group flex hover:bg-solana-purple/[0.03] px-4"
                    >
                      <span className="mr-6 inline-block w-8 select-none text-right font-mono text-xs text-muted-foreground/20 group-hover:text-muted-foreground/40">
                        {i + 1}
                      </span>
                      <span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          )}
        </div>
      </div>
    </div>
  );
}
