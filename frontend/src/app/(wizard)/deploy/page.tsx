"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DeployStep = "balance" | "airdrop" | "deploy" | "extract" | "done";

const deploySteps: { id: DeployStep; label: string; icon: string }[] = [
  { id: "balance", label: "CHECK BALANCE", icon: "\u25C7" },
  { id: "airdrop", label: "AIRDROP SOL", icon: "\u25C7" },
  { id: "deploy", label: "DEPLOY PROGRAM", icon: "\u25C7" },
  { id: "extract", label: "EXTRACT OUTPUTS", icon: "\u25C7" },
];

export default function DeployPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<DeployStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<DeployStep[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      import("canvas-confetti").then((confetti) => {
        const fire = confetti.default;
        const colors = ["#9945FF", "#14F195", "#00D4FF"];
        fire({ particleCount: 100, spread: 80, origin: { x: 0.2, y: 0.6 }, colors });
        fire({ particleCount: 100, spread: 80, origin: { x: 0.8, y: 0.6 }, colors });
        setTimeout(() => {
          fire({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.4 }, colors });
        }, 250);
      });
    }
  }, [showConfetti]);

  const markStep = (step: DeployStep) => setCurrentStep(step);

  const completeStep = (step: DeployStep) =>
    setCompletedSteps((prev) => [...prev, step]);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    setCompletedSteps([]);

    try {
      markStep("balance");
      const balRes = await fetch("/api/balance");
      const balData = await balRes.json();
      setBalance(balData.balance);
      completeStep("balance");

      markStep("airdrop");
      await fetch("/api/airdrop", { method: "POST" });
      completeStep("airdrop");

      markStep("deploy");
      const deployRes = await fetch("/api/deploy", { method: "POST" });
      if (!deployRes.ok) {
        const errData = await deployRes.json().catch(() => ({}));
        throw new Error(errData.error || "Deploy failed");
      }
      const deployData = await deployRes.json();
      setProgramId(deployData.programId);
      completeStep("deploy");

      markStep("extract");
      completeStep("extract");

      setCurrentStep("done");
      setShowConfetti(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setDeploying(false);
    }
  };

  const getStepStatus = (step: DeployStep) => {
    if (completedSteps.includes(step)) return "completed";
    if (currentStep === step) return "active";
    return "pending";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-solana-purple/50 uppercase mb-2">
            STEP 04 // DEPLOY
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Ship to <span className="gradient-text">devnet</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deploy your compiled program to Solana devnet
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/build")}
            className="rounded-lg border border-solana-purple/15 bg-transparent px-4 py-2 font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground hover:border-solana-purple/25 transition-all"
          >
            \u2190 BACK
          </button>
          {currentStep === "done" && (
            <button
              onClick={() => router.push("/export")}
              className="rounded-lg bg-solana-green/15 border border-solana-green/25 px-5 py-2 font-mono text-xs tracking-wider text-solana-green hover:bg-solana-green/20 transition-all"
            >
              EXPORT \u2192
            </button>
          )}
        </div>
      </div>

      {/* Deploy pipeline */}
      <div className="forge-card p-8">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-10">
          {deploySteps.map((step, i) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500 ${
                      status === "completed"
                        ? "border-solana-green/40 bg-solana-green/10 text-solana-green shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                        : status === "active"
                          ? "border-solana-purple/50 bg-solana-purple/15 text-solana-purple animate-pulse shadow-[0_0_20px_rgba(153,69,255,0.2)]"
                          : "border-solana-purple/10 bg-muted/50 text-muted-foreground/30"
                    }`}
                  >
                    {status === "completed" ? (
                      <span className="text-lg">\u2713</span>
                    ) : (
                      <span className="font-mono text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-[9px] tracking-[0.15em] font-medium ${
                      status === "completed"
                        ? "text-solana-green/70"
                        : status === "active"
                          ? "text-solana-purple"
                          : "text-muted-foreground/30"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < deploySteps.length - 1 && (
                  <div className="mx-3 flex-1 h-px relative">
                    <div className="absolute inset-0 bg-solana-purple/8" />
                    {completedSteps.includes(step.id) && (
                      <div className="absolute inset-0 bg-solana-green/40 step-line-filled" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action area */}
        <div className="text-center">
          {!deploying && !currentStep && (
            <button
              onClick={handleDeploy}
              className="neon-button rounded-xl px-12 py-4 font-mono text-sm tracking-wider"
            >
              INITIATE DEPLOY
            </button>
          )}

          {balance && (
            <p className="mt-3 font-mono text-xs text-muted-foreground/50">
              WALLET BALANCE: {balance} SOL
            </p>
          )}

          {error && (
            <div className="mt-6">
              <div className="inline-block rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-3">
                <p className="font-mono text-sm text-red-400">{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleDeploy}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-8 py-3 font-mono text-sm tracking-wider text-red-400 hover:bg-red-500/15 transition-all"
                >
                  RETRY
                </button>
              </div>
            </div>
          )}

          {currentStep === "done" && programId && (
            <div className="mt-4 inline-block rounded-xl border border-solana-green/20 bg-solana-green/5 p-6">
              <div className="font-mono text-[10px] tracking-[0.3em] text-solana-green/50 mb-2">
                DEPLOYED SUCCESSFULLY
              </div>
              <p className="font-mono text-lg text-solana-green break-all">
                {programId}
              </p>
              <div className="mt-3 font-mono text-[10px] text-muted-foreground/40">
                SOLANA DEVNET // PROGRAM ID
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
