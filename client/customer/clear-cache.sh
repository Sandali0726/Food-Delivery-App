#!/bin/bash
# Clear React/ESLint cache script

echo "🧹 Clearing all caches..."

cd "$(dirname "$0")"

# Remove ESLint cache
rm -rf .eslintcache
echo "✅ Removed .eslintcache"

# Remove build folder
rm -rf build
echo "✅ Removed build/"

# Remove node_modules cache
rm -rf node_modules/.cache
echo "✅ Removed node_modules/.cache"

# Remove any other cache folders
rm -rf .cache
echo "✅ Removed .cache"

echo ""
echo "🎉 All caches cleared!"
echo ""
echo "Now run: npm start"

