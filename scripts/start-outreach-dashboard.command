#!/bin/zsh

cd "$(dirname "$0")/.." || exit 1

url="http://127.0.0.1:4173"
open "$url"
node ./scripts/outreach-dashboard.js
