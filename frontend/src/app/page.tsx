"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STEPS = [
  { n: "01", label: "SELECT", desc: "Choose a template", icon: ">" },
  { n: "02", label: "REVIEW", desc: "Inspect the code", icon: "{}" },
  { n: "03", label: "BUILD", desc: "Compile on-chain", icon: ">>>" },
  { n: "04", label: "DEPLOY", desc: "Ship to devnet", icon: "^" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-solana-purple/10 blur-[120px]" />
        <div className="absolute -bottom-64 -right-64 h-[400px] w-[400px] rounded-full bg-solana-green/6 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-neon-cyan/3 blur-[80px]" />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />

      <main
        className={`relative z-10 flex flex-col items-center gap-10 text-center transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Forge logo */}
        <div className="float">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-solana-purple/20 to-solana-green/10 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-solana-purple/30 bg-void/80 pulse-glow">
              <div className="font-mono text-3xl font-bold gradient-text tracking-tighter">
                VC
              </div>
            </div>
          </div>
        </div>

        {/* Title block */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-xs tracking-[0.3em] text-solana-purple/60 uppercase">
            Solana devnet // smart contract factory
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="gradient-text">Vibe</span>
            <br />
            <span className="text-foreground">Contract</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground font-light leading-relaxed">
            Pick a template. Build it. Deploy it. Get your program ID, IDL, and
            TypeScript client — all in one click.
          </p>
        </div>

        {/* Step cards */}
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="forge-card ascii-corner relative flex flex-col items-start gap-3 px-5 py-5"
              style={{
                transitionDelay: mounted ? `${i * 100 + 200}ms` : "0ms",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <div className="font-mono text-[10px] text-solana-purple/40">
                {step.n}
              </div>
              <div className="font-mono text-2xl text-solana-purple/50">
                {step.icon}
              </div>
              <div>
                <div className="font-mono text-sm font-semibold tracking-wider text-foreground">
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-2">
          <Link
            href="/templates"
            className="neon-button inline-flex h-13 items-center justify-center rounded-xl px-10 text-base font-semibold tracking-wide"
          >
            GET STARTED
          </Link>
          <span className="font-mono text-[11px] text-muted-foreground/60 tracking-wider">
            DEPLOYS TO SOLANA DEVNET — NO REAL FUNDS NEEDED
          </span>
        </div>
      </main>
    </div>
  );
}
