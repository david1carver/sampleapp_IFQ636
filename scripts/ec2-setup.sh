#!/usr/bin/env bash
# scripts/ec2-setup.sh
# Optional convenience for the SOP deployment. Installs the base toolchain on an
# Ubuntu 22.04 EC2 instance (t3.large): nginx, Node.js 22 via nvm, pm2, yarn,
# and writes the nginx site that proxies / -> the React SPA on :3000.
#
# Run as the default 'ubuntu' user from anywhere:
#   chmod +x scripts/ec2-setup.sh && ./scripts/ec2-setup.sh
#
# This does NOT install the GitHub self-hosted runner or start the app — those
# steps are interactive and are covered in docs/A2/EC2_Deploy_Guide.docx.
# After this script: install the self-hosted runner, add the PROD environment
# secrets (MONGO_URI/JWT_SECRET/PORT), set the live baseURL in
# frontend/src/axiosConfig.jsx, then push to main to let CI/CD deploy.
set -euo pipefail

echo ">> Updating apt and installing nginx + curl + git"
sudo apt-get update -y
sudo apt-get install -y curl git nginx

echo ">> Installing nvm + Node.js 22"
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22

echo ">> Installing pm2 + yarn globally"
npm install -g pm2 yarn

echo ">> Symlinking node/npm/npx/pm2/yarn into /usr/local/bin"
# The GitHub self-hosted runner runs as a systemd service with a minimal PATH,
# so expose the nvm-installed tools on a system path it can see.
for t in node npm npx pm2 yarn; do
  sudo ln -sf "$(command -v "$t")" "/usr/local/bin/$t"
done

echo ">> Writing nginx site (proxies / -> :3000 React SPA)"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sudo cp "$REPO_DIR/scripts/nginx/restaurant-review.conf" /etc/nginx/sites-available/default
sudo nginx -t
sudo service nginx restart

echo ">> Base setup done."
echo ">> node: $(node --version)  pm2: $(pm2 --version)  yarn: $(yarn --version)"
echo ">> Next: install the GitHub self-hosted runner, add the MONGO_URI environment"
echo "   secrets + the PROD repo secret, set the live baseURL in"
echo "   frontend/src/axiosConfig.js, then push to main and register pm2."
echo ">> Open security group inbound ports 22, 80 and 5001."
