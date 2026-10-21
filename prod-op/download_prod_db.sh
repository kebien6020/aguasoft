#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")"/.. || exit

# pinned to tag 3.53.4
SQLITE_IMAGE='docker.io/keinos/sqlite3@sha256:6addaf450aea7e098e7d6f059d43501c317ec70494c1ace3cc94bfe1631cbfa5'

backup_command='sqlite3 db.sqlite ".backup /tmp/backup" && cat /tmp/backup'
remote_command=$"docker run --rm -u root -v aguasoft_db:/db -w /db '$SQLITE_IMAGE' sh -c '$backup_command'"

set -x
ssh agua_automation "$remote_command" > /tmp/backup.sqlite
set +x

if [[ $? == 0 ]]; then
	set -x
	rm server/db.sqlite*
	mv /tmp/backup.sqlite server/db.sqlite
	set +x
fi
