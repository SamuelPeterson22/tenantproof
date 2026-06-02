#!/bin/zsh

cd "$(dirname "$0")/.." || exit 1

url="http://127.0.0.1:4173"
node_bin="$(command -v node)"

if [[ -z "$node_bin" && -x "/Applications/Codex.app/Contents/Resources/node" ]]; then
  node_bin="/Applications/Codex.app/Contents/Resources/node"
fi

if [[ -z "$node_bin" ]]; then
  echo "TenantProof could not find Node.js. Open this project in Codex and ask Codex to start the outreach dashboard."
  read -k 1 "?Press any key to close."
  exit 1
fi

open "$url"
"$node_bin" ./scripts/outreach-dashboard.js
