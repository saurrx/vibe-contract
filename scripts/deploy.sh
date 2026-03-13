#!/bin/bash
# ============================================================
# 🚀 Vibe Contract — Deploy Script
# Deploys the built program to Solana devnet with friendly
# output and generates all output artifacts.
# ============================================================

set -euo pipefail

# -- Resolve project root ------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# -- Constants ------------------------------------------------
DEPLOYER_KEYPAIR="./deployer-keypair.json"
PROGRAM_KEYPAIR="target/deploy/active_program-keypair.json"
IDL_PATH="target/idl/active_program.json"
SO_PATH="target/deploy/active_program.so"
OUTPUT_DIR="output"
CLUSTER="devnet"
MIN_BALANCE=2  # SOL — airdrop if below this

# -- Header ---------------------------------------------------
echo ""
echo "🚀 Vibe Contract — Deploy to Devnet"
echo "===================================="
echo ""

# -- Pre-flight checks ----------------------------------------
echo "🔍 Running pre-flight checks..."

if ! command -v anchor &> /dev/null; then
    echo "❌ Error: 'anchor' CLI not found."
    exit 1
fi

if ! command -v solana &> /dev/null; then
    echo "❌ Error: 'solana' CLI not found."
    exit 1
fi

if [ ! -f "$DEPLOYER_KEYPAIR" ]; then
    echo "❌ Error: Deployer keypair not found at $DEPLOYER_KEYPAIR"
    exit 1
fi

if [ ! -f "$SO_PATH" ]; then
    echo "❌ Error: Program binary not found at $SO_PATH"
    echo "   💡 Run ./scripts/build.sh first"
    exit 1
fi

if [ ! -f "$PROGRAM_KEYPAIR" ]; then
    echo "❌ Error: Program keypair not found at $PROGRAM_KEYPAIR"
    echo "   💡 Run ./scripts/build.sh first"
    exit 1
fi

DEPLOYER_PUBKEY=$(solana address -k "$DEPLOYER_KEYPAIR")
echo "✅ Pre-flight checks passed"
echo ""
echo "👤 Deployer: $DEPLOYER_PUBKEY"

# -- Check balance & airdrop if needed ------------------------
echo "💰 Checking deployer balance..."

BALANCE=$(solana balance "$DEPLOYER_PUBKEY" --url "$CLUSTER" 2>/dev/null | awk '{print $1}')

if [ -z "$BALANCE" ]; then
    echo "⚠️  Could not fetch balance — continuing anyway"
    BALANCE=0
fi

echo "   Current balance: ${BALANCE} SOL"

# Compare balance (integer comparison, strip decimals)
BALANCE_INT=$(echo "$BALANCE" | cut -d. -f1)
if [ "$BALANCE_INT" -lt "$MIN_BALANCE" ] 2>/dev/null; then
    echo "📥 Balance below ${MIN_BALANCE} SOL — requesting airdrop..."

    # Try airdrop up to 2 times
    AIRDROP_SUCCESS=false
    for attempt in 1 2; do
        if solana airdrop 2 "$DEPLOYER_PUBKEY" --url "$CLUSTER" 2>/dev/null; then
            AIRDROP_SUCCESS=true
            break
        else
            echo "   ⚠️  Airdrop attempt $attempt failed (rate limit?), waiting..."
            sleep 3
        fi
    done

    if [ "$AIRDROP_SUCCESS" = true ]; then
        NEW_BALANCE=$(solana balance "$DEPLOYER_PUBKEY" --url "$CLUSTER" 2>/dev/null | awk '{print $1}')
        echo "   ✅ Airdrop successful! New balance: ${NEW_BALANCE} SOL"
    else
        echo "   ⚠️  Airdrop failed — deploy may fail if balance is too low"
        echo "   💡 Try manually: solana airdrop 2 $DEPLOYER_PUBKEY --url $CLUSTER"
    fi
fi

echo ""

# -- Deploy ---------------------------------------------------
echo "🚀 Deploying to $CLUSTER..."
echo "   (this may take 30-60 seconds)"
echo ""

DEPLOY_START=$(date +%s)

if anchor deploy --provider.cluster "$CLUSTER" 2>&1; then
    DEPLOY_END=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))

    echo ""
    echo "════════════════════════════════════════"
    echo "✅ Deploy succeeded! (${DEPLOY_DURATION}s)"
    echo "════════════════════════════════════════"
    echo ""
else
    DEPLOY_END=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))

    echo ""
    echo "════════════════════════════════════════"
    echo "❌ Deploy failed (${DEPLOY_DURATION}s)"
    echo "════════════════════════════════════════"
    echo ""
    echo "💡 Tips:"
    echo "   • Make sure you have enough SOL: solana balance $DEPLOYER_PUBKEY --url $CLUSTER"
    echo "   • Try airdrop: solana airdrop 2 $DEPLOYER_PUBKEY --url $CLUSTER"
    echo "   • Check devnet status: https://status.solana.com"
    echo ""
    exit 1
fi

# -- Extract program ID ---------------------------------------
PROGRAM_ID=$(solana address -k "$PROGRAM_KEYPAIR")
echo "🔑 Program ID: $PROGRAM_ID"
echo ""

# -- Create output artifacts ----------------------------------
echo "📦 Generating output artifacts..."

mkdir -p "$OUTPUT_DIR"

# Write program ID
echo "$PROGRAM_ID" > "$OUTPUT_DIR/program-id.txt"
echo "   ✅ output/program-id.txt"

# Copy IDL
if [ -f "$IDL_PATH" ]; then
    cp "$IDL_PATH" "$OUTPUT_DIR/idl.json"
    echo "   ✅ output/idl.json"
else
    echo "   ⚠️  IDL not found at $IDL_PATH"
fi

# -- Run generator scripts ------------------------------------
echo ""
echo "📝 Generating client snippet..."
node "$SCRIPT_DIR/generate-client-snippet.js"

echo "📖 Generating program README..."
node "$SCRIPT_DIR/generate-readme.js"

echo "📦 Generating metadata..."
node "$SCRIPT_DIR/generate-metadata.js"

# -- Summary --------------------------------------------------
echo ""
echo "════════════════════════════════════════════════"
echo "🎉 Deploy complete! Your output bundle is ready"
echo "════════════════════════════════════════════════"
echo ""
echo "📂 Output files:"
echo "   • output/program-id.txt     — Program ID"
echo "   • output/idl.json           — Anchor IDL"
echo "   • output/client-snippet.ts  — TypeScript usage examples"
echo "   • output/program-readme.md  — Paste into AI chat for frontend"
echo "   • output/metadata.json      — Everything bundled as JSON"
echo ""
echo "🔗 Solana Explorer:"
echo "   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet"
echo ""
