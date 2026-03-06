#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# Copyright 2026 FINOS
#
# Add SPDX Apache 2.0 license headers to all CALMGuard source files.
# Idempotent — skips files that already have the SPDX identifier.
# Run from the repo root: bash scripts/add-license-headers.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

TS_HEADER='// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS'

YAML_HEADER='# SPDX-License-Identifier: Apache-2.0
# Copyright 2026 FINOS'

MD_HEADER='<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->'

ADDED=0
SKIPPED=0

add_header() {
  local file="$1"
  local header="$2"

  # Idempotency guard: skip if SPDX already present
  if grep -q "SPDX-License-Identifier" "$file"; then
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  local tmp
  tmp=$(mktemp)
  printf '%s\n\n' "$header" | cat - "$file" > "$tmp" && mv "$tmp" "$file"
  ADDED=$((ADDED + 1))
  echo "  + $file"
}

echo "Adding SPDX headers..."
echo ""

# TypeScript source files (src/**/*.ts and src/**/*.tsx)
echo "TypeScript / TSX files:"
while IFS= read -r -d '' file; do
  add_header "$file" "$TS_HEADER"
done < <(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)

# YAML agent definition files
echo ""
echo "YAML files (agents/):"
while IFS= read -r -d '' file; do
  add_header "$file" "$YAML_HEADER"
done < <(find agents -type f -name "*.yaml" -print0)

# Markdown skill files
echo ""
echo "Markdown files (skills/):"
while IFS= read -r -d '' file; do
  add_header "$file" "$MD_HEADER"
done < <(find skills -type f -name "*.md" -print0)

echo ""
echo "Done. Added: $ADDED, Skipped (already had header): $SKIPPED"
