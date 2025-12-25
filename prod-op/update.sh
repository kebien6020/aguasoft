#!/bin/sh

curl -fsSLo docker-compose.yml "https://raw.githubusercontent.com/kebien6020/aguasoft/master/docker-compose.prod.yml?c=$(date +%s)"
grep image: docker-compose.yml
