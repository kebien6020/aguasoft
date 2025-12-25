#!/bin/sh

docker compose pull
docker stack deploy -c docker-compose.yml aguasoft
