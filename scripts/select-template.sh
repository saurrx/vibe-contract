#!/bin/bash
# ============================================================
# 📋 Vibe Contract — Template Selector
# Copies a template's lib.rs into the active program slot
# and updates the declare_id! to match the program keypair.
# ============================================================

set -euo pipefail

# -- Resolve project root ------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# -- Constants ------------------------------------------------
TEMPLATES_DIR="templates"
ACTIVE_PROGRAM_SRC="programs/active-program/src/lib.rs"
PROGRAM_KEYPAIR="target/deploy/active_program-keypair.json"
VALID_TEMPLATES=("escrow" "voting" "tipping" "registry" "coinflip" "blank")
OUTPUT_DIR="output"

# -- Usage ----------------------------------------------------
usage() {
    echo ""
    echo "📋 Vibe Contract — Template Selector"
    echo "====================================="
    echo ""
    echo "Usage: $0 <template-name>"
    echo ""
    echo "Available templates:"
    for t in "${VALID_TEMPLATES[@]}"; do
        if [ -f "$TEMPLATES_DIR/$t/lib.rs" ]; then
            echo "  ✅ $t"
        else
            echo "  ⏳ $t (not yet created)"
        fi
    done
    echo ""
    exit 1
}

# -- Validate arguments ---------------------------------------
if [ $# -lt 1 ]; then
    usage
fi

TEMPLATE="$1"

echo ""
echo "📋 Vibe Contract — Template Selector"
echo "====================================="
echo ""

# Check if template name is valid
VALID=false
for t in "${VALID_TEMPLATES[@]}"; do
    if [ "$t" = "$TEMPLATE" ]; then
        VALID=true
        break
    fi
done

if [ "$VALID" = false ]; then
    echo "❌ Unknown template: '$TEMPLATE'"
    echo ""
    echo "   Valid templates: ${VALID_TEMPLATES[*]}"
    exit 1
fi

# Check if template lib.rs exists
TEMPLATE_SRC="$TEMPLATES_DIR/$TEMPLATE/lib.rs"
if [ ! -f "$TEMPLATE_SRC" ]; then
    echo "❌ Template '$TEMPLATE' doesn't have a lib.rs yet."
    echo "   Expected: $TEMPLATE_SRC"
    exit 1
fi

echo "📦 Selected template: $TEMPLATE"

# -- Get program ID from keypair ------------------------------
if [ -f "$PROGRAM_KEYPAIR" ]; then
    PROGRAM_ID=$(solana address -k "$PROGRAM_KEYPAIR" 2>/dev/null || echo "")
    if [ -z "$PROGRAM_ID" ]; then
        echo "⚠️  Could not read program ID from keypair, using placeholder"
        PROGRAM_ID="YOUR_PROGRAM_ID_HERE"
    else
        echo "🔑 Program ID: $PROGRAM_ID"
    fi
else
    echo "⚠️  Program keypair not found at $PROGRAM_KEYPAIR"
    echo "   Using placeholder — run 'anchor build' first to generate it"
    PROGRAM_ID="YOUR_PROGRAM_ID_HERE"
fi

# -- Copy template --------------------------------------------
echo "📝 Copying $TEMPLATE_SRC → $ACTIVE_PROGRAM_SRC"
cp "$TEMPLATE_SRC" "$ACTIVE_PROGRAM_SRC"

# -- Replace declare_id! with actual program ID ---------------
echo "🔧 Updating declare_id! to $PROGRAM_ID"

# Match declare_id!("...") with any content inside quotes
if grep -q 'declare_id!' "$ACTIVE_PROGRAM_SRC"; then
    sed -i '' "s/declare_id!(\"[^\"]*\")/declare_id!(\"${PROGRAM_ID}\")/" "$ACTIVE_PROGRAM_SRC"
    echo "✅ declare_id! updated"
else
    echo "⚠️  No declare_id! found in template — adding one"
    # Prepend declare_id! after the use statements
    sed -i '' "1s/^/declare_id!(\"${PROGRAM_ID}\");\n\n/" "$ACTIVE_PROGRAM_SRC"
fi

# -- Save template name for other scripts ---------------------
mkdir -p "$OUTPUT_DIR"
echo "$TEMPLATE" > "$OUTPUT_DIR/template-name.txt"

echo ""
echo "════════════════════════════════════════"
echo "✅ Template '$TEMPLATE' is now active!"
echo "════════════════════════════════════════"
echo ""
echo "📄 Active program: $ACTIVE_PROGRAM_SRC"
echo "🚀 Next step: ./scripts/build.sh"
echo ""
