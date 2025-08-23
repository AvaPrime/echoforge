#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <namespace> <secret-name> [env-file=.env]"
  exit 1
fi

NS=$1
NAME=$2
ENVFILE=${3:-.env}

if [[ ! -f "$ENVFILE" ]]; then
  echo "Env file '$ENVFILE' not found"
  exit 1
fi

kubectl -n "$NS" create secret generic "$NAME" \
  --from-env-file="$ENVFILE" \
  --dry-run=client -o yaml | kubectl apply -f -
echo "Secret $NAME applied to namespace $NS"
