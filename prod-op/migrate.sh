#!/bin/sh
docker exec $(docker ps -q -f name=aguasoft_aguasoft) sh -c 'cd server && npx sequelize-cli db:migrate --config dist/db/config.js --env production'
