#!/bin/sh
docker exec "$(docker ps -q -f name=aguasoft_aguasoft)" node ./server/dist/scripts/migrate.js
