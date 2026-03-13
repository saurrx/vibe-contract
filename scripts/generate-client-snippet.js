#!/usr/bin/env node
// ============================================================
// 📝 Vibe Contract — Client Snippet Generator
// Reads the Anchor IDL and generates a TypeScript file showing
// how to call each instruction using @coral-xyz/anchor.
// ============================================================

const fs = require("fs");
const path = require("path");

// -- Paths ---------------------------------------------------
const PROJECT_ROOT = path.resolve(__dirname, "..");
const IDL_PATH = path.join(PROJECT_ROOT, "target", "idl", "active_program.json");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "client-snippet.ts");

// -- Helpers -------------------------------------------------

// Convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// Convert snake_case to PascalCase
function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Map IDL type to TypeScript type string
function idlTypeToTs(idlType) {
  if (typeof idlType === "string") {
    const map = {
      bool: "boolean",
      u8: "number",
      i8: "number",
      u16: "number",
      i16: "number",
      u32: "number",
      i32: "number",
      u64: "BN",
      i64: "BN",
      u128: "BN",
      i128: "BN",
      f32: "number",
      f64: "number",
      string: "string",
      publicKey: "PublicKey",
      pubkey: "PublicKey",
      bytes: "Buffer",
    };
    return map[idlType] || idlType;
  }
  if (idlType.vec) return `${idlTypeToTs(idlType.vec)}[]`;
  if (idlType.option) return `${idlTypeToTs(idlType.option)} | null`;
  if (idlType.array) return `${idlTypeToTs(idlType.array[0])}[]`;
  if (idlType.defined) return idlType.defined.name || idlType.defined;
  return "any";
}

// -- Main ----------------------------------------------------
function main() {
  console.log("");
  console.log("📝 Vibe Contract — Generate Client Snippet");
  console.log("===========================================");
  console.log("");

  // Read IDL
  if (!fs.existsSync(IDL_PATH)) {
    console.log("❌ IDL not found at", IDL_PATH);
    console.log("   💡 Run ./scripts/build.sh first");
    process.exit(1);
  }

  const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const programName = idl.metadata?.name || "active_program";
  const programAddress = idl.address || "YOUR_PROGRAM_ID";
  const instructions = idl.instructions || [];

  console.log(`📋 Program: ${programName}`);
  console.log(`🔑 Address: ${programAddress}`);
  console.log(`📦 Instructions: ${instructions.length}`);
  console.log("");

  // Build the TypeScript snippet
  let ts = "";

  // -- Header / imports
  ts += `// ============================================================\n`;
  ts += `// 🚀 Vibe Contract — Client Snippet\n`;
  ts += `// Auto-generated TypeScript showing how to call each instruction\n`;
  ts += `// using @coral-xyz/anchor.\n`;
  ts += `//\n`;
  ts += `// Program: ${programName}\n`;
  ts += `// Address: ${programAddress}\n`;
  ts += `// Network: devnet\n`;
  ts += `// ============================================================\n\n`;

  ts += `import { AnchorProvider, Program, setProvider, BN } from "@coral-xyz/anchor";\n`;
  ts += `import { Connection, PublicKey, Keypair, clusterApiUrl } from "@solana/web3.js";\n\n`;

  // -- IDL import note
  ts += `// 🎨 CUSTOMIZE: Import your IDL (copy idl.json into your project)\n`;
  ts += `import idl from "./idl.json";\n\n`;

  // -- Provider setup
  ts += `// ============================================================\n`;
  ts += `// Provider Setup\n`;
  ts += `// ============================================================\n\n`;

  ts += `// 🎨 CUSTOMIZE: Replace with your connection and wallet setup\n`;
  ts += `const connection = new Connection(clusterApiUrl("devnet"), "confirmed");\n\n`;

  ts += `// If using a browser wallet (e.g. Phantom):\n`;
  ts += `// const provider = new AnchorProvider(connection, window.solana, { commitment: "confirmed" });\n\n`;

  ts += `// If using a local keypair:\n`;
  ts += `const wallet = Keypair.generate(); // 🎨 CUSTOMIZE: Use your actual keypair\n`;
  ts += `const provider = new AnchorProvider(\n`;
  ts += `  connection,\n`;
  ts += `  {\n`;
  ts += `    publicKey: wallet.publicKey,\n`;
  ts += `    signAllTransactions: async (txs) => {\n`;
  ts += `      txs.forEach((tx) => tx.sign(wallet));\n`;
  ts += `      return txs;\n`;
  ts += `    },\n`;
  ts += `    signTransaction: async (tx) => {\n`;
  ts += `      tx.sign(wallet);\n`;
  ts += `      return tx;\n`;
  ts += `    },\n`;
  ts += `  },\n`;
  ts += `  { commitment: "confirmed" }\n`;
  ts += `);\n`;
  ts += `setProvider(provider);\n\n`;

  // -- Program instance
  ts += `// ============================================================\n`;
  ts += `// Program Instance\n`;
  ts += `// ============================================================\n\n`;

  ts += `const PROGRAM_ID = new PublicKey("${programAddress}");\n`;
  ts += `const program = new Program(idl as any, provider);\n\n`;

  // -- Instruction examples
  ts += `// ============================================================\n`;
  ts += `// Instruction Examples\n`;
  ts += `// ============================================================\n\n`;

  if (instructions.length === 0) {
    ts += `// No instructions found in the IDL.\n`;
  }

  for (const ix of instructions) {
    const fnName = toCamelCase(ix.name);
    const accounts = ix.accounts || [];
    const args = ix.args || [];

    ts += `// ----------------------------------------------------------\n`;
    ts += `// 📌 ${ix.name}\n`;
    if (args.length > 0) {
      ts += `//    Args: ${args.map((a) => `${a.name}: ${idlTypeToTs(a.type)}`).join(", ")}\n`;
    }
    if (accounts.length > 0) {
      ts += `//    Accounts: ${accounts.map((a) => a.name).join(", ")}\n`;
    }
    ts += `// ----------------------------------------------------------\n`;

    ts += `async function call_${ix.name}() {\n`;

    // Account setup comments
    for (const acc of accounts) {
      const isMut = acc.writable;
      const isSigner = acc.signer;
      const flags = [isMut && "writable", isSigner && "signer"]
        .filter(Boolean)
        .join(", ");
      const flagStr = flags ? ` // ${flags}` : "";
      ts += `  const ${toCamelCase(acc.name)} = new PublicKey("...");${flagStr}\n`;
    }
    if (accounts.length > 0) ts += `\n`;

    // Build method call
    ts += `  const txSig = await program.methods\n`;
    ts += `    .${fnName}(`;

    if (args.length > 0) {
      ts += `\n`;
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        const tsType = idlTypeToTs(a.type);
        let placeholder;
        if (tsType === "BN") placeholder = `new BN(0)`;
        else if (tsType === "boolean") placeholder = `false`;
        else if (tsType === "number") placeholder = `0`;
        else if (tsType === "string") placeholder = `""`;
        else if (tsType === "PublicKey") placeholder = `new PublicKey("...")`;
        else placeholder = `null /* ${tsType} */`;

        const comma = i < args.length - 1 ? "," : "";
        ts += `      ${placeholder}${comma} // ${a.name}: ${tsType}\n`;
      }
      ts += `    `;
    }
    ts += `)\n`;

    // Accounts
    if (accounts.length > 0) {
      ts += `    .accounts({\n`;
      for (const acc of accounts) {
        ts += `      ${toCamelCase(acc.name)}: ${toCamelCase(acc.name)},\n`;
      }
      ts += `    })\n`;
    }

    ts += `    .rpc();\n\n`;
    ts += `  console.log("✅ ${ix.name} tx:", txSig);\n`;
    ts += `}\n\n`;
  }

  // -- Footer
  ts += `// ============================================================\n`;
  ts += `// 🚀 EXTEND: Add your own logic below!\n`;
  ts += `// ============================================================\n`;

  // Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, ts, "utf-8");

  console.log(`✅ Generated: ${OUTPUT_PATH}`);
  console.log("");
}

main();
