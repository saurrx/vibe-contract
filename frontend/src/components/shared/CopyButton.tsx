"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-md border px-2.5 py-1 font-mono text-[10px] tracking-wider transition-all ${
        copied
          ? "border-solana-green/30 bg-solana-green/10 text-solana-green"
          : "border-solana-purple/15 bg-transparent text-muted-foreground/50 hover:text-muted-foreground hover:border-solana-purple/30"
      } ${className}`}
    >
      {copied ? "\u2713 COPIED" : "COPY"}
    </button>
  );
}
