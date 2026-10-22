#!/usr/bin/env bash

cd "$(dirname ${BASH_SOURCE[0]})"
cd ../

# Shared image to work around DigitalOcean's dumb limit on repositories
IMAGE=registry.digitalocean.com/kev/aguasoft

function img_not_exists() {
	local img="$1"
	docker manifest inspect "$img" >/dev/null
}

function publish() {
	local img_name="$1"
	local ctx="$2"
	local target="$3"
	local tag="$(<prod-op/version xargs echo)"
	local img="$IMAGE:$img_name-$tag"
	if img_not_exists "$img"; then
		>&2 echo "Not publishing $img because it already exists"
		return 0
	fi

	local imgs=(
		"$img"
		"$IMAGE:$img_name-latest"
	)
	local img_flags=()
	for img in "${imgs[@]}"; do
		img_flags+=(-t "$img")
	done

	if [ -n "$target" ]; then
		img_flags+=(--target "$target")
	fi

	( set -x;
	  docker buildx build "$ctx" "${img_flags[@]}" --push )
}

publish server . server
publish nginx . client
publish certbot docker/certbot
