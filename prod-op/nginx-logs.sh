#!/bin/bash

docker logs `docker ps -f name=aguasoft_nginx -ql` -f --tail 500
