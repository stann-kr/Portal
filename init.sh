#!/bin/sh
set -x
echo "Starting Next.js installation..."
npx -y create-next-app@latest temp_app --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes </dev/null
echo "Installation complete. Moving files..."
mv temp_app/* temp_app/.[!.]* .
rm -rf temp_app
echo "Done!"
