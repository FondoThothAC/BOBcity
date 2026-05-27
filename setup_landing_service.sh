#!/bin/bash
cat << 'SERVICE' | sudo tee /etc/systemd/system/fondothoth-landing.service
[Unit]
Description=Fondo Thoth Landing Page Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/fondothoth-landing
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable fondothoth-landing
sudo systemctl restart fondothoth-landing

cat << 'NGINX' | sudo tee /etc/nginx/sites-available/fondothoth-landing
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/fondothoth-landing /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
