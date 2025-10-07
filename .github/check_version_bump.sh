#!/usr/bin/env bash
set -x

versions_bumped=$(
	git diff origin/master -- docker-compose.prod.yml |
		grep '+    image: ghcr.io' |
		wc -l
)

expected=3
if [ "$versions_bumped" -lt "$expected" ]; then
	echo "Error: Not all versions have been bumped. Found $versions_bumped version bumps, expected $expected."
	exit 1
fi
