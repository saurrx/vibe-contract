#!/bin/bash
# ============================================================
# 🔨 Vibe Contract — Build Script
# Wraps `anchor build` with friendly, emoji-rich output.
# ============================================================

set -euo pipefail

# -- Resolve project root (one level up from scripts/) -------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# -- Constants ------------------------------------------------
IDL_PATH="target/idl/active_program.json"
KEYPAIR_PATH="target/deploy/active_program-keypair.json"
SO_PATH="target/deploy/active_program.so"

# -- Header ---------------------------------------------------
echo ""
echo "🔨 Vibe Contract — Build"
echo "========================"
echo ""

# -- Pre-flight checks ----------------------------------------
echo "🔍 Running pre-flight checks..."

if ! command -v anchor &> /dev/null; then
    echo "❌ Error: 'anchor' CLI not found. Please install Anchor."
    echo "   👉 https://www.anchor-lang.com/docs/installation"
    exit 1
fi

if [ ! -f "Anchor.toml" ]; then
    echo "❌ Error: Anchor.toml not found in project root."
    exit 1
fi

if [ ! -d "programs/active-program" ]; then
    echo "❌ Error: programs/active-program/ not found."
    echo "   💡 Did you run select-template.sh first?"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# -- Build ----------------------------------------------------
echo "🏗️  Building program with 'anchor build'..."
echo "   (this may take a minute on first run)"
echo ""

BUILD_START=$(date +%s)

# Stream build output, capture exit code
if anchor build 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_DURATION=$((BUILD_END - BUILD_START))

    echo ""
    echo "════════════════════════════════════════"
    echo "✅ Build succeeded! (${BUILD_DURATION}s)"
    echo "════════════════════════════════════════"
    echo ""

    # -- Report artifacts --------------------------------------
    if [ -f "$IDL_PATH" ]; then
        echo "📄 IDL:          $IDL_PATH"
    else
        echo "⚠️  IDL not found at $IDL_PATH"
    fi

    if [ -f "$SO_PATH" ]; then
        SO_SIZE=$(du -h "$SO_PATH" | cut -f1)
        echo "📦 Program:      $SO_PATH ($SO_SIZE)"
    fi

    if [ -f "$KEYPAIR_PATH" ]; then
        echo "🔑 Program key:  $KEYPAIR_PATH"
    fi

    echo ""
    echo "🚀 Ready to deploy! Run: ./scripts/deploy.sh"
    echo ""
else
    BUILD_END=$(date +%s)
    BUILD_DURATION=$((BUILD_END - BUILD_START))

    echo ""
    echo "════════════════════════════════════════"
    echo "❌ Build failed (${BUILD_DURATION}s)"
    echo "════════════════════════════════════════"
    echo ""
    echo "💡 Tips:"
    echo "   • Check the error messages above"
    echo "   • Make sure Rust and Solana CLI are installed"
    echo "   • Try 'anchor build' directly for more details"
    echo ""
    exit 1
fi
