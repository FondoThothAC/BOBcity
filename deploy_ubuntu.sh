#!/usr/bin/env bash
# ==============================================================================
# 🚀 CÍVICAOS / CIVICPULSE: AUTOMATED UBUNTU VPS DEPLOYMENT SCRIPT
# ==============================================================================
# Objective: Installs Node.js, Python3, SQLite, Nginx, compiles the React App,
# sets up a systemd service, and configures an Nginx reverse proxy with SSL.
#
# Target OS: Ubuntu 20.04 / 22.04 / 24.04 LTS (run as root / sudo)
# ==============================================================================

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run this script with sudo or as root."
  exit 1
fi

set -e

# Configuration variables
APP_DIR="/opt/plataforma"
DOMAIN_NAME="144.24.23.61" # Your public VPS IP address
SERVICE_NAME="civicpulse"

echo "======================================================================"
echo "⚡ Starting system upgrade and dependencies installation..."
echo "======================================================================"

export DEBIAN_FRONTEND=noninteractive

# 1. System Updates (Skipping upgrade to prevent GRUB/interactive prompts and reduce deploy time)
apt-get update -y

# 2. Core Dependencies (With non-interactive safety flags)
apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
  curl python3 python3-pip python3-venv sqlite3 nginx git certbot python3-certbot-nginx

# 3. Node.js & NPM Installation (Node 20 LTS)
echo "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installations
echo "✅ Python Version: $(python3 --version)"
echo "✅ SQLite Version: $(sqlite3 --version)"
echo "✅ Node Version: $(node --version)"
echo "✅ NPM Version: $(npm --version)"

# 4. Directory setup and copy
echo "📁 Setting up application directory..."
mkdir -p "$APP_DIR"
# Copy contents to /opt/plataforma (assuming you have uploaded or cloned here)
# If installing directly, copy current working directory files:
# cp -r . "$APP_DIR"

# 5. Build React Production Frontend (Skip if pre-compiled dist is present to save RAM/time)
echo "🏗️ Checking frontend assets..."
if [ -f "$APP_DIR/dist/index.html" ]; then
  echo "✅ Pre-compiled dist/ directory found. Skipping Node/NPM compilation to save VPS memory and time."
else
  echo "📦 No pre-compiled assets found. Compiling on VPS..."
  cd "$APP_DIR"
  npm install
  npm run build
fi

# 6. Setup systemd Service Daemon for backend + frontend (Port 5001)
echo "⚙️ Configuring systemd service daemon..."
cat <<EOF > /etc/systemd/system/$SERVICE_NAME.service
[Unit]
Description=CivicPulse Consolidated Engine Server (GUI + APIs)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/simulation
ExecStart=/usr/bin/python3 $APP_DIR/simulation/api_server.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# Reload daemon, enable and start service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "🚀 checking service status..."
systemctl status $SERVICE_NAME --no-pager | head -n 15

# 7. Configure Nginx Reverse Proxy
echo "🔒 Generating self-signed SSL certificate for IP address CN=$DOMAIN_NAME..."
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/$SERVICE_NAME.key \
  -out /etc/nginx/ssl/$SERVICE_NAME.crt \
  -subj "/C=MX/ST=Sonora/L=Hermosillo/O=CivicaOS/OU=CivicIntelligence/CN=$DOMAIN_NAME"

echo "🌐 Configuring Nginx reverse proxy on port 80 and 443 (SSL)..."
cat <<EOF > /etc/nginx/sites-available/$SERVICE_NAME
server {
    listen 80;
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/nginx/ssl/$SERVICE_NAME.crt;
    ssl_certificate_key /etc/nginx/ssl/$SERVICE_NAME.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Dynamic API redirects
    location /run-swarm {
        proxy_pass http://127.0.0.1:5001/run-swarm;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    location /run-simulation {
        proxy_pass http://127.0.0.1:5001/run-simulation;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }

    # Static site serve & routing fallback
    location / {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activate site, remove default, and test nginx
ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 8. Configure Firewall (ufw & iptables) to allow Port 80 and 443
echo "🛡️ Configuring firewall to open HTTP (80) and HTTPS (443) ports..."
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
  echo "🔓 Opening ports 80 and 443 in UFW..."
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw reload
fi

if command -v iptables &> /dev/null; then
  echo "🔓 Opening ports 80 and 443 in iptables..."
  # Check if rule already exists to avoid duplicates
  if ! iptables -C INPUT -p tcp --dport 80 -j ACCEPT &> /dev/null; then
    iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
  fi
  if ! iptables -C INPUT -p tcp --dport 443 -j ACCEPT &> /dev/null; then
    iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
  fi

  # Persist rules
  if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
  elif [ -d "/etc/iptables" ]; then
    iptables-save | tee /etc/iptables/rules.v4
  fi
fi

echo "======================================================================"
echo "🛡️ SSL SETUP (LET'S ENCRYPT)"
echo "======================================================================"
echo "To secure your VPS connection with automatic HTTPS, run the following:"
echo "sudo certbot --nginx -d $DOMAIN_NAME"
echo ""
echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Your platform is active on: http://$DOMAIN_NAME (Proxying port 5001)"
echo "Check systemd service logs with: journalctl -u $SERVICE_NAME -f"
echo "======================================================================"
