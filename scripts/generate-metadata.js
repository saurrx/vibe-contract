#!/usr/bin/env node
// ============================================================
// 📦 Vibe Contract — Metadata Generator
// Bundles all outputs into a single metadata.json file.
// ============================================================

const fs = require("fs");
const path = require("path");

// -- Paths ---------------------------------------------------
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "output");
const IDL_PATH = path.join(PROJECT_ROOT, "target", "idl", "active_program.json");
const PROGRAM_ID_PATH = path.join(OUTPUT_DIR, "program-id.txt");
const CLIENT_SNIPPET_PATH = path.join(OUTPUT_DIR, "client-snippet.ts");
const TEMPLATE_NAME_PATH = path.join(OUTPUT_DIR, "template-name.txt");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "metadata.json");

// -- Main ----------------------------------------------------
function main() {
  console.log("");
  console.log("📦 Vibe Contract — Generate Metadata");
  console.log("=====================================");
  console.log("");

  // Read IDL
  if (!fs.existsSync(IDL_PATH)) {
    console.log("❌ IDL not found at", IDL_PATH);
    console.log("   💡 Run ./scripts/build.sh first");
    process.exit(1);
  }

  const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const programName = idl.metadata?.name || "active_program";
  const anchorVersion = idl.metadata?.spec || "0.1.0";

  // Read program ID
  let programId = idl.address || "NOT_YET_DEPLOYED";
  if (fs.existsSync(PROGRAM_ID_PATH)) {
    programId = fs.readFileSync(PROGRAM_ID_PATH, "utf-8").trim();
  }

  // Read client snippet
  let typescript = "";
  if (fs.existsSync(CLIENT_SNIPPET_PATH)) {
    typescript = fs.readFileSync(CLIENT_SNIPPET_PATH, "utf-8");
  } else {
    console.log("⚠️  client-snippet.ts not found — run generate-client-snippet.js first");
  }

  // Read template name
  let templateUsed = "unknown";
  if (fs.existsSync(TEMPLATE_NAME_PATH)) {
    templateUsed = fs.readFileSync(TEMPLATE_NAME_PATH, "utf-8").trim();
  }

  // Extract instruction summaries
  const instructions = (idl.instructions || []).map((ix) => ({
    name: ix.name,
    args: (ix.args || []).map((a) => ({ name: a.name, type: a.type })),
    accounts: (ix.accounts || []).map((a) => ({
      name: a.name,
      writable: !!a.writable,
      signer: !!a.signer,
    })),
  }));

  // Build explorer URL
  const explorerUrl = `https://explorer.solana.com/address/${programId}?cluster=devnet`;

  // Bundle metadata
  const metadata = {
    programId,
    network: "devnet",
    anchorVersion,
    templateUsed,
    deployedAt: new Date().toISOString(),
    explorerUrl,
    instructions,
    idl,
    typescript,
  };

  // Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(metadata, null, 2), "utf-8");

  console.log(`📋 Program: ${programName}`);
  console.log(`🔑 Program ID: ${programId}`);
  console.log(`🌐 Network: devnet`);
  console.log(`📦 Template: ${templateUsed}`);
  console.log(`📄 Instructions: ${instructions.length}`);
  console.log(`🔗 Explorer: ${explorerUrl}`);
  console.log("");
  console.log(`✅ Generated: ${OUTPUT_PATH}`);
  console.log("");
}

main();
