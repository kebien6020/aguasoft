#!/bin/bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl start docker

mkdir -p /opt/aguasoft
cd /opt/aguasoft

version="v1.0.2"

cat <<'EOF' >docker-compose.tmpl.yml
services:
  server:
    image: registry.digitalocean.com/kev/aguasoft:server-$version
    environment:
      - DB_PATH=/db/db.sqlite
    networks:
      - main
    volumes:
      - db:/db
      - uploads:/app/uploads
  nginx:
    image: registry.digitalocean.com/kev/aguasoft:nginx-$version
    networks:
      - main
    ports:
      - 80:80
      - 443:443
    volumes:
      - certbot-etc:/etc/letsencrypt
      - uploads:/app/uploads
  certbot:
    image: registry.digitalocean.com/kev/aguasoft:certbot-$version
    volumes:
      - certbot-var-lib:/var/lib/letsencrypt
      - certbot-etc:/etc/letsencrypt
    secrets:
      - digitalocean_credentials
networks:
  main:

volumes:
  uploads:
  db:
  certbot-var-lib:
  certbot-etc:

secrets:
  digitalocean_credentials:
    external: true
EOF

cat <<'EOF' >version.sh
#!/bin/bash
export version="$1"
if [ -z "$version" ]; then
  >&2 echo "Usage: $0 <version>"
  exit 1
fi

envsubst '$version' <docker-compose.tmpl.yml >docker-compose.yml
EOF

cat <<'EOF' >deploy.sh
#!/bin/sh
docker compose pull
docker stack deploy -c docker-compose.yml aguasoft
EOF

cat <<'EOF' >logs.sh
#!/bin/bash
docker logs "$(docker ps -f name=aguasoft_server -ql)" -f
EOF

cat <<'EOF' >monitor.sh
#!/bin/bash
watch docker ps
EOF

cat <<'EOF' >nginx-logs.sh
#!/bin/bash
docker logs "$(docker ps -f name=aguasoft_nginx -ql)" -f --tail 500
EOF

cat <<'EOF' >create-secret.sh
#!/bin/bash
printf "do token (for DNS management): " 
read -s token
docker secret create digitalocean_credentials - <<EOS
dns_digitalocean_token="$token"
EOS
EOF

cat <<'EOF' >docker-login.sh
#!/bin/bash
printf "do token (for registry access): "
read -s token
docker login registry.digitalocean.com/kev -u kevin.pena.prog@gmail.com --password-stdin <<< "$token"
EOF

chmod +x *.sh

./version.sh "$version"

public_ip="$(curl -s ifconfig.me)"
docker swarm init --advertise-addr "$public_ip"
