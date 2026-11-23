#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")"/.. || exit

if [ ! -f server/db.sqlite ]; then
	>&2 echo "No db found to restore"
	exit 1
fi

if [ -f server/db.sqlite-wal ]; then
	>&2 echo "Refusing to restore file with existing WAL log"
	exit 1
fi

cat >/tmp/restore.sh <<'SH'
#!/usr/bin/env bash
set -x
cd /opt/aguasoft || exit 1

# pinned to tag 3.53.4
SQLITE_IMAGE='docker.io/keinos/sqlite3@sha256:6addaf450aea7e098e7d6f059d43501c317ec70494c1ace3cc94bfe1631cbfa5'

backup_file='/tmp/db.restore.sqlite'

if [ ! -f "$backup_file" ]; then
	>&2 echo "No db found to restore on the remote"
	exit 1
fi

# Shutdown app
docker service scale aguasoft_server=0 aguasoft_nginx=0

# Create backup of current state, just in case
backup_command='sqlite3 db.sqlite ".backup /tmp/backup" && cat /tmp/backup'
outfile="db.$(date -u +"%Y-%m-%dT%H.%M.%S.000Z").sqlite"
docker run --rm -u root -v aguasoft_db:/db -w /db "$SQLITE_IMAGE" sh -c "$backup_command" > "$outfile"

# Restore backup
restore_command="sqlite3 db.sqlite '.restore $backup_file'"
docker run --rm -u root -v aguasoft_db:/db -w /db -v "$backup_file":"$backup_file" "$SQLITE_IMAGE" sh -c "$restore_command" > "$outfile"

# Start app
docker service scale aguasoft_server=1 aguasoft_nginx=1
SH

chmod +x /tmp/restore.sh

# Copy script and DB
set -x
scp /tmp/restore.sh agua_blue:/tmp/restore.sh
scp server/db.sqlite agua_blue:/tmp/db.restore.sqlite

# Run
ssh agua_blue /tmp/restore.sh
