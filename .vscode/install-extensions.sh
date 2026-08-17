#!/usr/bin/env bash
# Installs the extensions recommended in .vscode/extensions.json.
set -euo pipefail

command -v code >/dev/null 2>&1 || exit 0

sed 's#//.*##' "$DEVBOX_PROJECT_ROOT/.vscode/extensions.json" \
	| grep -oE '"[A-Za-z0-9][A-Za-z0-9_-]*\.[A-Za-z0-9][A-Za-z0-9_-]*"' \
	| tr -d '"' \
	| xargs -I{} code --install-extension {} >/dev/null 2>&1 || true
