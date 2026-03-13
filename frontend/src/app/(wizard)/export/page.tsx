"use client";

import { useEffect, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import CopyButton from "@/components/shared/CopyButton";

interface Outputs {
  programId: string;
  idl: string;
  clientSnippet: string;
  readme: string;
}

const tabs = [
  { id: "program-id", label: "PROGRAM ID" },
  { id: "idl", label: "IDL" },
  { id: "typescript", label: "TYPESCRIPT" },
  { id: "readme", label: "README" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ExportPage() {
  const [outputs, setOutputs] = useState<Outputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("program-id");

  useEffect(() => {
    fetch("/api/outputs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load outputs");
        return res.json();
      })
      .then(setOutputs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadAll = () => {
    if (!outputs) return;
    const files = [
      { name: "program-id.txt", content: outputs.programId },
      { name: "idl.json", content: outputs.idl },
      { name: "client-snippet.ts", content: outputs.clientSnippet },
      { name: "program-readme.md", content: outputs.readme },
    ];
    for (const file of files) {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-solana-purple border-t-transparent" />
          <span className="font-mono text-xs text-muted-foreground/50">
            LOADING OUTPUTS...
          </span>
        </div>
      </div>
    );
  }

  if (error || !outputs) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="text-3xl text-muted-foreground/20">\u2205</div>
        <p className="font-mono text-sm text-destructive">
          {error || "No outputs found"}
        </p>
        <p className="font-mono text-xs text-muted-foreground/40">
          Deploy your program first to see outputs here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-solana-purple/50 uppercase mb-2">
            STEP 05 // EXPORT
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Your <span className="gradient-text">outputs</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy these into your frontend project or paste the README into AI chat.
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="neon-button rounded-lg px-6 py-2.5 font-mono text-xs tracking-wider"
        >
          \u2193 DOWNLOAD ALL
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 font-mono text-[11px] tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-solana-purple/15 text-solana-purple border border-solana-purple/25"
                : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "program-id" && (
        <div className="forge-card p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/40 mb-3">
                DEPLOYED PROGRAM ID // SOLANA DEVNET
              </div>
              <p className="font-mono text-2xl text-solana-green break-all leading-relaxed">
                {outputs.programId}
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`https://explorer.solana.com/address/${outputs.programId}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] tracking-wider text-solana-purple/50 hover:text-solana-purple border border-solana-purple/15 rounded px-3 py-1 transition-colors"
                >
                  VIEW ON EXPLORER \u2197
                </a>
              </div>
            </div>
            <CopyButton text={outputs.programId} />
          </div>
        </div>
      )}

      {activeTab === "idl" && (
        <OutputCode code={outputs.idl} language="json" label="idl.json" />
      )}

      {activeTab === "typescript" && (
        <OutputCode
          code={outputs.clientSnippet}
          language="typescript"
          label="client-snippet.ts"
        />
      )}

      {activeTab === "readme" && (
        <OutputCode
          code={outputs.readme}
          language="markdown"
          label="program-readme.md"
        />
      )}
    </div>
  );
}

function OutputCode({
  code,
  language,
  label,
}: {
  code: string;
  language: string;
  label: string;
}) {
  return (
    <div className="terminal-chrome">
      <div className="terminal-bar">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground/50">
          {label}
        </span>
        <div className="flex-1" />
        <CopyButton text={code} />
      </div>
      <div className="max-h-[60vh] overflow-auto terminal-scroll p-4">
        <Highlight theme={themes.nightOwl} code={code} language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="text-[12px] leading-5">
              {tokens.map((line, i) => (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className="hover:bg-solana-purple/[0.02]"
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
