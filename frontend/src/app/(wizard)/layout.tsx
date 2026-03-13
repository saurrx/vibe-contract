import Header from "@/components/shared/Header";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">
        {/* Ambient background effects */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-solana-purple/5 blur-[100px]" />
          <div className="absolute -right-40 bottom-20 h-[300px] w-[300px] rounded-full bg-solana-green/3 blur-[80px]" />
        </div>
        <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
