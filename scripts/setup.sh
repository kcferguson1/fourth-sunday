#!/usr/bin/env bash
# Fourth Sunday — one-shot setup script
#
# What this does:
#   1. Checks that Node.js and clasp are installed
#   2. Checks that you're logged into clasp
#   3. Prompts for your Apps Script Script ID
#   4. Writes src/.clasp.json
#   5. Runs `clasp push` to deploy the code to your sheet
#
# Usage:
#   bash scripts/setup.sh
#
# After this finishes:
#   Reload your Google Sheet and click Fourth Sunday → First-time Setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ok()   { echo -e "${GREEN}✓${NC}  $1"; }
warn() { echo -e "${YELLOW}!${NC}  $1"; }
fail() { echo -e "${RED}✗${NC}  $1"; exit 1; }

echo ""
echo "Fourth Sunday — setup"
echo "─────────────────────"
echo ""

# ── 1. Check Node.js ────────────────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Go to https://nodejs.org, download the LTS version, and run the installer. Then re-run this script."
fi
ok "Node.js $(node --version) found"

# ── 2. Check clasp ───────────────────────────────────────────────────────────

if ! command -v clasp &>/dev/null; then
  echo ""
  warn "clasp is not installed. Installing now..."
  npm install -g @google/clasp
  ok "clasp installed"
else
  ok "clasp $(clasp --version 2>/dev/null | head -1) found"
fi

# ── 3. Check clasp login ─────────────────────────────────────────────────────

CLASP_RC="$HOME/.clasprc.json"
if [ ! -f "$CLASP_RC" ]; then
  echo ""
  warn "You are not logged into clasp yet."
  echo "   Running: clasp login"
  echo "   A browser window will open — sign in with the Google account that owns your sheet."
  echo ""
  clasp login
fi
ok "Logged into clasp"

# ── 4. Prompt for Script ID ──────────────────────────────────────────────────

echo ""
echo "You need the Script ID from your Google Sheet."
echo ""
echo "   How to find it:"
echo "   1. Open your Google Sheet"
echo "   2. Click Extensions → Apps Script"
echo "   3. Look at the URL — it looks like:"
echo "      https://script.google.com/home/projects/  ABC123...LONG_ID.../edit"
echo "                                                 ↑ copy this part"
echo ""
read -r -p "Paste your Script ID here and press Enter: " SCRIPT_ID

if [ -z "$SCRIPT_ID" ]; then
  fail "Script ID cannot be empty."
fi

# Strip any accidental whitespace or quotes
SCRIPT_ID=$(echo "$SCRIPT_ID" | tr -d '[:space:]"'"'")

# ── 5. Write .clasp.json ─────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CLASP_JSON="$REPO_ROOT/src/.clasp.json"

echo "{\"scriptId\":\"$SCRIPT_ID\",\"rootDir\":\".\"}" > "$CLASP_JSON"
ok "Created src/.clasp.json"

# ── 6. Push the code ─────────────────────────────────────────────────────────

echo ""
echo "Pushing code to your sheet..."
echo ""

cd "$REPO_ROOT/src"
clasp push --force

echo ""
ok "Code pushed successfully"

# ── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Go back to your Google Sheet and reload the page"
echo "     (press Cmd+R on Mac or Ctrl+R on Windows)"
echo ""
echo "  2. You should see a 'Fourth Sunday' menu in the menu bar"
echo ""
echo "  3. Click  Fourth Sunday → First-time Setup"
echo ""
echo "  4. Follow the authorization prompts"
echo ""
echo "  5. When setup completes, fill in the Settings, Wards,"
echo "     and Speakers tabs with your stake's real data"
echo ""
echo "  6. Click  Fourth Sunday → Run Rollover"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""
