#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TOOLS="$ROOT/.tools"
VERSION="2.104.0"
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) ASSET_ARCH="amd64" ;;
  arm64) ASSET_ARCH="arm64" ;;
  *)
    echo "Unsupported macOS architecture: $ARCH" >&2
    exit 1
    ;;
esac

ASSET="supabase_${VERSION}_darwin_${ASSET_ARCH}.tar.gz"
BASE_URL="https://github.com/supabase/cli/releases/download/v${VERSION}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TOOLS"
curl -fsSL "$BASE_URL/checksums.txt" -o "$TMP/checksums.txt"
curl -fL "$BASE_URL/$ASSET" -o "$TMP/$ASSET"

EXPECTED=$(awk -v asset="$ASSET" '$2 == asset { print $1 }' "$TMP/checksums.txt")
ACTUAL=$(shasum -a 256 "$TMP/$ASSET" | awk '{ print $1 }')
if [ -z "$EXPECTED" ] || [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "Supabase CLI checksum verification failed." >&2
  exit 1
fi

tar -xzf "$TMP/$ASSET" -C "$TMP"
mv "$TMP/supabase" "$TOOLS/supabase-cli"
chmod +x "$TOOLS/supabase-cli"
"$TOOLS/supabase-cli" --version
