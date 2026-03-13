"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { number: 1, label: "SELECT", path: "/templates" },
  { number: 2, label: "CODE", path: "/code" },
  { number: 3, label: "BUILD", path: "/build" },
  { number: 4, label: "DEPLOY", path: "/deploy" },
  { number: 5, label: "EXPORT", path: "/export" },
];

export default function Header() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((s) => pathname.startsWith(s.path));

  return (
    <header className="sticky top-0 z-50 border-b border-solana-purple/10 bg-void/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-solana-purple/30 bg-solana-purple/10 transition-colors group-hover:bg-solana-purple/20">
            <span className="font-mono text-[10px] font-bold gradient-text">VC</span>
          </div>
          <span className="font-mono text-sm font-semibold tracking-wider text-foreground/80 group-hover:text-foreground transition-colors">
            VIBE CONTRACT
          </span>
        </Link>

        {/* Step Progress — Desktop */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {steps.map((step, i) => {
            const isActive = pathname.startsWith(step.path);
            const isCompleted = currentStepIndex > i;
            return (
              <div key={step.number} className="flex items-center">
                {i > 0 && (
                  <div className="mx-1 flex items-center">
                    <div
                      className={`h-px w-8 transition-colors duration-300 ${
                        isCompleted
                          ? "bg-solana-green/50"
                          : "bg-solana-purple/10"
                      }`}
                    />
                  </div>
                )}
                <Link
                  href={step.path}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-solana-purple/15 text-solana-purple border border-solana-purple/25"
                      : isCompleted
                        ? "text-solana-green/70 hover:text-solana-green"
                        : "text-muted-foreground/50 hover:text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold ${
                      isActive
                        ? "bg-solana-purple text-white"
                        : isCompleted
                          ? "bg-solana-green/20 text-solana-green"
                          : "bg-muted text-muted-foreground/40"
                    }`}
                  >
                    {isCompleted ? "\u2713" : step.number}
                  </span>
                  <span className="hidden lg:inline">{step.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Mobile step indicator */}
        <div className="flex items-center md:hidden">
          {currentStepIndex >= 0 && (
            <span className="font-mono text-[10px] tracking-widest text-solana-purple/70 border border-solana-purple/20 rounded px-2 py-0.5">
              {currentStepIndex + 1} / 5
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
