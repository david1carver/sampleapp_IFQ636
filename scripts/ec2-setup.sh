#!/usr/bin/env bash
# scripts/ec2-setup.sh
# One-time provisioning for an Ubuntu 22.04 EC2 instance (t2.micro) to host the
# Restaurant Review Platform: Node.js 20, pm2, nginx (reverse proxy + static
# host), and the backend process. Run as the default 'ubuntu' user.
#
#   chmod +x scripts/ec2-setup.sh && ./scripts/ec2-setup.sh
#
# Prerequisites: clone the repo to ~/sampleapp_IFQ636 and create
# backend/.env (PORT=5001, MONGO_URI=..., JWT_SECRET=...) before/after running.
set -euo pipefail

echo ">> Updating apt and installing base packages"
sudo apt-get update -y
sudo apt-get install -y curl git nginx

echo ">> Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ">> Installing pm2 globally"
sudo npm install -g pm2

echo ">> Installing backend dependencies"
cd ~/sampleapp_IFQ636/backend
npm ci --omit=dev

echo ">> Starting backend under pm2"
pm2 describe mesa-backend > /dev/null 2>&1 \
  && pm2 restart mesa-backend \
  || pm2 start server.js --name mesa-backend
pm2 save
# Configure pm2 to start on boot (prints a command — run it as instructed).
pm2 startup systemd -u "$USER" --hp "$HOME" || true

echo ">> Configuring nginx"
sudo mkdir -p /var/www/restaurant-review
sudo cp ~/sampleapp_IFQ636/scripts/nginx/restaurant-review.conf /etc/nginx/sites-available/restaurant-review
sudo ln -sf /etc/nginx/sites-available/restaurant-review /etc/nginx/sites-enabled/restaurant-review
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ">> Done. Backend on :5001 (pm2), nginx serving / and proxying /api."
echo ">> Open security group inbound ports 22, 80 (and 5001 if testing directly)."
