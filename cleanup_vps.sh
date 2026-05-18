#!/usr/bin/env bash
# ==============================================================================
# 🧹 CÍVICAOS / CIVICPULSE: SAFE VPS CLEANUP & WIPE SCRIPT
# ==============================================================================
# Objective: Stops old running services, cleans up old Nginx configurations,
# and clears out the application folder to ensure a 100% clean deployment.
#
# Target OS: Ubuntu 20.04 / 22.04 / 24.04 LTS (run as root / sudo)
# ==============================================================================

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run this script with sudo or as root."
  exit 1
fi

echo "======================================================================"
echo "⚠️  WARNING: THIS SCRIPT WILL WIPE OLD WEB CONFIGURATIONS!"
echo "======================================================================"
echo "This will:"
echo "1. Stop and delete the civicpulse systemd service (if running)."
echo "2. Disable and delete Nginx configurations under sites-enabled/available."
echo "3. Safely wipe the /opt/plataforma folder to avoid file conflicts."
echo "======================================================================"
# Allow auto-approving via environment variable, argument, or non-interactive TTY detection
CONFIRM_ARG="${1:-""}"
if [ "$CONFIRM_ARG" = "yes" ] || [ "$CONFIRM_ARG" = "-y" ] || [ "$CONFIRM_ARG" = "--yes" ]; then
  CONFIRM="yes"
elif [ -t 0 ]; then
  read -p "⚠️  Are you sure you want to proceed? (yes/no): " CONFIRM
else
  echo "⚠️ Non-interactive shell detected. Auto-approving cleanup."
  CONFIRM="yes"
fi

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Cleanup cancelled by user."
  exit 0
fi

set -e

echo "🧹 Initiating clean sweep of the VPS..."

# 1. Stop and remove existing systemd service
SERVICE_NAME="civicpulse"
if systemctl list-unit-files | grep -q "^$SERVICE_NAME.service"; then
  echo "🛑 Stopping and disabling old $SERVICE_NAME systemd service..."
  systemctl stop $SERVICE_NAME || true
  systemctl disable $SERVICE_NAME || true
  rm -f /etc/systemd/system/$SERVICE_NAME.service
  systemctl daemon-reload
  echo "✅ Old systemd service removed."
else
  echo "ℹ️ No old systemd service found. Skipping."
fi

# Also check and stop pm2 (commonly used for Node apps) if installed
if command -v pm2 &> /dev/null; then
  echo "🛑 Stopping and deleting PM2 processes..."
  pm2 kill || true
  npm uninstall -g pm2 || true
  echo "✅ PM2 cleaned."
fi

# 2. Clean Nginx virtual hosts
echo "🌐 Cleaning Nginx site configurations..."
# Remove ALL enabled sites to fully disable any previous projects
rm -f /etc/nginx/sites-enabled/*

# Remove actual config files in sites-available for specific known services
rm -f /etc/nginx/sites-available/$SERVICE_NAME
rm -f /etc/nginx/sites-available/plataforma
rm -f /etc/nginx/sites-available/previous_app

# Test Nginx and reload
nginx -t || true
systemctl restart nginx
echo "✅ Nginx configurations cleared and restarted."

# 3. Clean up the application folder (/opt/plataforma)
APP_DIR="/opt/plataforma"
if [ -d "$APP_DIR" ]; then
  echo "📁 Found existing directory at $APP_DIR."
  # Create a zip backup of the old files just in case!
  BACKUP_PATH="/root/backup_plataforma_$(date +%Y%m%d_%H%M%S).tar.gz"
  echo "📦 Creating a safety backup of your old folder at: $BACKUP_PATH"
  tar -czf "$BACKUP_PATH" -C "$APP_DIR" . || true
  
  echo "🔥 Wiping folder: $APP_DIR..."
  rm -rf "$APP_DIR"
  echo "✅ Old directory wiped."
else
  echo "ℹ️ Target directory $APP_DIR does not exist. Skipping."
fi

# 4. Clean system packages caches
echo "🧹 Cleaning system package manager caches..."
apt-get autoremove -y
apt-get clean -y

echo "======================================================================"
echo "🎉 WIPE COMPLETE!"
echo "Your VPS is now 100% clean and ready for a fresh install."
echo "======================================================================"
echo "💡 NEXT STEP:"
echo "Copy your fresh files to '/opt/plataforma' and run:"
echo "sudo bash /opt/plataforma/deploy_ubuntu.sh"
echo "======================================================================"
