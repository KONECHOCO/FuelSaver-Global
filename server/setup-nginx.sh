#!/bin/bash
# Attiva fuel.ikonetsolutions.com -> container fuel-api (127.0.0.1:8096). Eseguire con: sudo bash /home/choco/apps/fuel-api/setup-nginx.sh
set -e
DOMAIN=fuel.ikonetsolutions.com
DIR=/home/choco/apps/fuel-api
SERVER_IP=23.88.32.156

RESOLVED=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')
if [ "$RESOLVED" != "$SERVER_IP" ]; then
  echo "ERRORE: $DOMAIN non punta ancora a $SERVER_IP (risolve a: '${RESOLVED:-nessuno}')."
  echo "Aggiungi il record DNS A 'fuel' -> $SERVER_IP e riprova tra qualche minuto."
  exit 1
fi

mkdir -p /var/www/certbot
# 1) Solo HTTP, per la verifica Let's Encrypt
cat > /etc/nginx/sites-available/$DOMAIN <<CONF
server {
    listen 80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { proxy_pass http://127.0.0.1:8096; }
}
CONF
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t && systemctl reload nginx

# 2) Certificato
certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --non-interactive --agree-tos -m konechocoproduction@gmail.com

# 3) Configurazione finale HTTPS
cp $DIR/nginx-fuel.ikonetsolutions.com.conf /etc/nginx/sites-available/$DOMAIN
nginx -t && systemctl reload nginx
curl -s https://$DOMAIN/api/health | head -c 200; echo
echo "OK: https://$DOMAIN attivo"
