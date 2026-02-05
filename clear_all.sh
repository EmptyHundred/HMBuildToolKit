#!/bin/bash

# Clear all built artifacts from projects under scripts/
# Keeps only source files: src/, package.json, tsconfig.json, etc.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"

echo "Clearing build artifacts from $SCRIPTS_DIR..."

# Find and remove all dist/ and node_modules/ directories
for project in "$SCRIPTS_DIR"/*/; do
    if [ -d "$project" ]; then
        project_name=$(basename "$project")

        # Remove dist directory
        if [ -d "$project/dist" ]; then
            echo "  Removing $project_name/dist/"
            rm -rf "$project/dist"
        fi

        # Remove node_modules directory
        if [ -d "$project/node_modules" ]; then
            echo "  Removing $project_name/node_modules/"
            rm -rf "$project/node_modules"
        fi
    fi
done

echo "Done. All build artifacts cleared."
