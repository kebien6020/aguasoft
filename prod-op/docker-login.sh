#!/usr/bin/env bash
printf "do token (for registry access): "
read -s token
docker login registry.digitalocean.com/kev -u kevin.pena.prog@gmail.com --password-stdin <<< "$token"
