"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  tag: string;
  description: string;
  difficulty: "EASY" | "MEDIUM";
  instructions: string[];
  icon: string;
}

const templates: Template[] = [
  {
    id: "escrow",
    name: "Escrow",
    tag: "DEFI",
    description:
      "Two-party escrow that locks funds until both sides agree. Great for trustless trades and conditional payments.",
    difficulty: "MEDIUM",
    instructions: ["initialize", "release", "cancel"],
    icon: "\u{1F512}",
  },
  {
    id: "voting",
    name: "Voting",
    tag: "GOVERNANCE",
    description:
      "On-chain proposal and voting system. Create proposals, cast votes, tally results with one-vote-per-wallet.",
    difficulty: "MEDIUM",
    instructions: ["create_poll", "cast_vote", "close_poll"],
    icon: "\u{1F5F3}\uFE0F",
  },
  {
    id: "tipping",
    name: "Tipping",
    tag: "SOCIAL",
    description:
      "Send SOL tips to any wallet. Perfect for content creators, streamers, and community appreciation.",
    difficulty: "EASY",
    instructions: ["create_jar", "send_tip", "withdraw"],
    icon: "\u{1F4B8}",
  },
  {
    id: "registry",
    name: "Registry",
    tag: "DATA",
    description:
      "Key-value store on Solana. Register names, records, or metadata on-chain with owner-controlled updates.",
    difficulty: "EASY",
    instructions: ["create_registry", "add_entry", "update_entry"],
    icon: "\u{1F4CB}",
  },
  {
    id: "coinflip",
    name: "Coin Flip",
    tag: "GAME",
    description:
      "2-player on-chain coin flip with pseudo-random outcome. Create, join, and resolve with SOL wagers.",
    difficulty: "EASY",
    instructions: ["create_game", "join_game", "resolve"],
    icon: "\u{1FA99}",
  },
  {
    id: "blank",
    name: "Blank",
    tag: "SCAFFOLD",
    description:
      "Empty Anchor program scaffold with commented extension points. Start from scratch with all boilerplate ready.",
    difficulty: "EASY",
    instructions: ["initialize"],
    icon: "\u{1F4E6}",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = async (templateId: string) => {
    setSelecting(templateId);
    try {
      const res = await fetch("/api/select-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateId }),
      });
      if (!res.ok) throw new Error("Failed to select template");
      router.push("/code");
    } catch {
      setSelecting(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Section header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.3em] text-solana-purple/50 uppercase mb-2">
          STEP 01 // SELECT
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Choose your <span className="gradient-text">contract</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Each template is a production-ready Anchor program. Pick one and customize with AI.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const isHovered = hoveredId === t.id;
          return (
            <div
              key={t.id}
              className={`forge-card relative flex flex-col p-0 overflow-hidden transition-all duration-300 ${
                isHovered ? "scale-[1.01]" : ""
              }`}
              onMouseEnter={() => setHoveredId(t.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Card header */}
              <div className="flex items-start justify-between p-5 pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {t.name}
                    </h3>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/50">
                      {t.tag}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-mono text-[10px] tracking-wider rounded px-2 py-0.5 ${
                    t.difficulty === "EASY"
                      ? "text-solana-green/70 bg-solana-green/8 border border-solana-green/15"
                      : "text-solana-purple/70 bg-solana-purple/8 border border-solana-purple/15"
                  }`}
                >
                  {t.difficulty}
                </span>
              </div>

              {/* Description */}
              <div className="px-5 pt-3 pb-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Instructions preview */}
              <div className="px-5 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {t.instructions.map((instr) => (
                    <span
                      key={instr}
                      className="font-mono text-[10px] text-solana-purple/40 bg-solana-purple/5 rounded px-1.5 py-0.5"
                    >
                      {instr}()
                    </span>
                  ))}
                </div>
              </div>

              {/* Select button */}
              <div className="border-t border-solana-purple/8 p-3">
                <button
                  onClick={() => handleSelect(t.id)}
                  disabled={selecting !== null}
                  className={`w-full rounded-lg py-2.5 font-mono text-sm font-medium tracking-wider transition-all ${
                    selecting === t.id
                      ? "bg-solana-purple/20 text-solana-purple animate-pulse"
                      : "bg-solana-purple/8 text-solana-purple/80 hover:bg-solana-purple/15 hover:text-solana-purple"
                  }`}
                >
                  {selecting === t.id ? "LOADING..." : "SELECT \u2192"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
