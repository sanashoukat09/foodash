#!/bin/bash
# ============================================================
# FOODASH - EC2 DEPLOYMENT SCRIPT
# Run this on your EC2 Ubuntu instance after SSH'ing in
# ============================================================

# ── STEP 1: Update system & install dependencies ─────────────
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 globally
sudo npm install -g pm2

# ── STEP 2: Clone / upload your project ──────────────────────
# Option A: If using git
# git clone https://github.com/YOUR_USERNAME/foodash.git
# cd foodash

# Option B: If uploading via scp (run from your local machine):
# scp -r -i your-key.pem ./foodash ubuntu@YOUR_EC2_IP:~/

cd ~/foodash

# ── STEP 3: Install & build backend ──────────────────────────
cd backend
npm install
# Edit .env with your real values:
# nano .env   ← set MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, CLIENT_URL

# ── STEP 4: Install & build frontend ─────────────────────────
cd ../frontend
npm install
# Edit .env with your real Stripe publishable key:
# nano .env   ← set VITE_STRIPE_PUBLIC_KEY

npm run build   # Creates dist/ folder

# ── STEP 5: Start backend with PM2 ───────────────────────────
cd ../backend
pm2 start server.js --name "foodash-api"
pm2 startup     # Follow the printed command to auto-start on reboot
pm2 save

# ── STEP 6: Configure Nginx ───────────────────────────────────
sudo tee /etc/nginx/sites-available/foodash << 'NGINX'
server {
    listen 80;
    server_name YOUR_EC2_IP_OR_DOMAIN;

    # Serve React frontend
    root /home/ubuntu/foodash/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/foodash /etc/nginx/sites-enabled/foodash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment complete! Visit http://YOUR_EC2_IP"
