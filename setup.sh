#!/bin/bash
# ============================================================
# Vibe Contract — First-Time Setup
# Run this once after forking the Repl. It installs all the
# Solana toolchain dependencies so you can build & deploy.
# ============================================================

set -euo pipefail

echo ""
echo "========================================="
echo "  Vibe Contract — First-Time Setup"
echo "========================================="
echo ""

# -- 1. Rust --------------------------------------------------
echo "[1/6] Installing Rust toolchain..."
if command -v rustc &> /dev/null; then
    echo "       Rust already installed: $(rustc --version)"
else
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
    source "$HOME/.cargo/env"
    echo "       Installed: $(rustc --version)"
fi
echo ""

# -- 2. Solana CLI ---------------------------------------------
echo "[2/6] Installing Solana CLI..."
if command -v solana &> /dev/null; then
    echo "       Solana CLI already installed: $(solana --version)"
else
    sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "       Installed: $(solana --version)"
fi
echo ""

# -- 3. Anchor (via AVM) --------------------------------------
echo "[3/6] Installing Anchor CLI via AVM..."
if command -v anchor &> /dev/null; then
    echo "       Anchor already installed: $(anchor --version)"
else
    cargo install --git https://github.com/coral-xyz/anchor avm --force
    avm install 0.31.1
    avm use 0.31.1
    echo "       Installed: $(anchor --version)"
fi
echo ""

# -- 4. Deployer keypair --------------------------------------
echo "[4/6] Setting up deployer keypair..."
if [ -f "./deployer-keypair.json" ]; then
    echo "       Keypair already exists."
else
    solana-keygen new --outfile ./deployer-keypair.json --no-bip39-passphrase --force
    echo "       New keypair generated."
fi
solana config set --url devnet --keypair ./deployer-keypair.json
echo "       Configured for devnet."
echo ""

# -- 5. Airdrop -----------------------------------------------
echo "[5/6] Requesting devnet airdrop (2 SOL)..."
PUBKEY=$(solana-keygen pubkey ./deployer-keypair.json)
echo "       Wallet: $PUBKEY"
solana airdrop 2 "$PUBKEY" --url devnet || {
    echo "       Airdrop failed (rate limited). Try again later or use:"
    echo "       https://faucet.solana.com"
}
echo ""

# -- 6. Node modules ------------------------------------------
echo "[6/6] Installing npm dependencies..."
npm install
cd frontend && npm install && cd ..
echo ""

# -- Done ------------------------------------------------------
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "  Next steps:"
echo "    1. Click Run to start the frontend"
echo "    2. Pick a template from the gallery"
echo "    3. Build and deploy your contract"
echo ""
