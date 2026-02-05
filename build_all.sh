#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"

apps=("errmapper" "linter" "transpiler" "typechecker")

echo "Building all apps in scripts/"
echo "=============================="

for app in "${apps[@]}"; do
    app_dir="$SCRIPTS_DIR/$app"

    if [ -d "$app_dir" ]; then
        echo ""
        echo "Building $app..."
        echo "----------------------------"

        cd "$app_dir"

        echo "Installing dependencies..."
        npm install

        echo "Building..."
        npm run build

        echo "$app built successfully!"
    else
        echo "Warning: $app_dir not found, skipping..."
    fi
done

echo ""
echo "=============================="
echo "All apps built successfully!"
