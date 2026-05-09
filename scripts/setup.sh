#!/usr/bin/env bash
# Fourth Sunday — one-shot setup script
#
# What this does:
#   1. Checks that Node.js is installed (installs clasp if missing)
#   2. Logs into clasp (opens browser once, cached after that)
#   3. Creates a new Google Sheet + bound Apps Script project automatically
#   4. Writes src/.clasp.json automatically (no Script ID copy-paste needed)
#   5. Pushes all .gs files to the sheet
#   6. Opens the sheet in your browser
#
# Usage:
#   bash scripts/setup.sh
#
# After this finishes:
#   Reload the sheet tab and click  Fourth Sunday → First-time Setup

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
warn() { echo -e "${YELLOW}!${NC}  $1"; }
info() { echo -e "${CYAN}→${NC}  $1"; }
fail() { echo -e "${RED}✗${NC}  $1"; exit 1; }

echo ""
echo "Fourth Sunday — setup"
echo "─────────────────────────────────────────────"
echo ""

# ── Locate repo root ─────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$REPO_ROOT/src"

# ── 1. Check Node.js ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed.\n   Go to https://nodejs.org, click the LTS button, and run the installer.\n   Then re-run this script."
fi
ok "Node.js $(node --version)"

# ── 2. Ensure clasp is installed ─────────────────────────────────────────────
if ! command -v clasp &>/dev/null; then
  warn "clasp not found — installing..."
  npm install -g @google/clasp
  ok "clasp installed"
else
  ok "clasp $(clasp --version 2>/dev/null | head -1 | tr -d '\n')"
fi

# ── 3. Log in if needed ───────────────────────────────────────────────────────
if [ ! -f "$HOME/.clasprc.json" ] || ! grep -q '"access_token"' "$HOME/.clasprc.json" 2>/dev/null; then
  echo ""
  info "Logging into clasp — a browser window will open."
  info "Sign in with the Google account that will own the sheet, then return here."
  echo ""
  clasp login
fi
ok "Logged into clasp"

# ── 4. Check for existing .clasp.json ────────────────────────────────────────
CLASP_JSON="$SRC_DIR/.clasp.json"
if [ -f "$CLASP_JSON" ]; then
  echo ""
  warn "A .clasp.json already exists in src/."
  read -r -p "   Create a NEW sheet anyway? (y/N): " OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
    info "Keeping existing setup. Running clasp push with current .clasp.json..."
    cd "$SRC_DIR"
    clasp push --force
    ok "Code pushed. Reload your sheet tab and click Fourth Sunday → First-time Setup."
    exit 0
  fi
fi

# ── 5. Create the sheet + script project ─────────────────────────────────────
echo ""
info "Creating a new Google Sheet and Apps Script project..."
echo ""

cd "$SRC_DIR"

# clasp create outputs lines like:
#   Created new Google Sheets script: https://script.google.com/d/SCRIPT_ID/edit
#   Spreadsheet: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
CLASP_OUTPUT=$(clasp create --type sheets --title "Fourth Sunday — Working Copy" 2>&1)
echo "$CLASP_OUTPUT"

# Extract spreadsheet URL from output
SHEET_URL=$(echo "$CLASP_OUTPUT" | grep -o 'https://docs.google.com/spreadsheets/d/[^[:space:]]*' | head -1)

# Fallback: read parentId from the generated .clasp.json
if [ -z "$SHEET_URL" ] && [ -f "$CLASP_JSON" ]; then
  PARENT_ID=$(grep -o '"parentId":"[^"]*"' "$CLASP_JSON" 2>/dev/null | cut -d'"' -f4)
  if [ -n "$PARENT_ID" ]; then
    SHEET_URL="https://docs.google.com/spreadsheets/d/${PARENT_ID}/edit"
  fi
fi

ok "Sheet created"

# ── 6. Push the code ─────────────────────────────────────────────────────────
echo ""
info "Pushing code to the sheet..."
clasp push --force
ok "Code pushed"

# ── 7. Open the sheet ────────────────────────────────────────────────────────
if [ -n "$SHEET_URL" ]; then
  echo ""
  info "Opening the sheet in your browser..."
  # Mac
  if command -v open &>/dev/null; then
    open "$SHEET_URL"
  # Linux / WSL
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$SHEET_URL"
  else
    echo "   Sheet URL: $SHEET_URL"
  fi
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "  Done! Your sheet is open in the browser."
echo ""
echo "  Next steps:"
echo ""
echo "  1. Reload the sheet tab  (Cmd+R on Mac, Ctrl+R on Windows)"
echo ""
echo "  2. Click  Fourth Sunday → First-time Setup"
echo "     (Follow the authorization prompts the first time)"
echo ""
echo "  3. Fill in the Settings, Wards, and Speakers tabs"
echo "     with your stake's real data"
echo ""
echo "  4. Click  Fourth Sunday → Run Rollover"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
