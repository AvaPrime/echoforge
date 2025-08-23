#!/usr/bin/env bash
# ---------------------------------------------------------
# Run the EchoForge env-check scaffolder.
#   * Ensures ./scripts exists
#   * Ensures init script is executable
#   * Forwards any args (e.g. --force, --force-config)
# ---------------------------------------------------------

set -euo pipefail

# Ensure the scripts directory exists (idempotent)
mkdir -p "$(dirname "$0")"

SCRIPT="$(dirname "$0")/init-env-check.js"

if [[ ! -f "$SCRIPT" ]]; then
  echo "❌  Cannot find $SCRIPT – did you copy the init script to scripts/?"
  exit 1
fi

# Make it executable (harmless if already executable)
chmod +x "$SCRIPT"

# Run it, forwarding any flags
node "$SCRIPT" "$@"
