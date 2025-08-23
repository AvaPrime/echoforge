#!/usr/bin/env bash
set -euo pipefail

RELEASE=${1:-echoforge}

echo "Listing Helm history for $RELEASE" && helm history "$RELEASE"
read -p "Enter revision to rollback to: " REV

if [[ -z "$REV" ]]; then
  echo "No revision provided. Exiting."
  exit 1
fi

helm rollback "$RELEASE" "$REV"
