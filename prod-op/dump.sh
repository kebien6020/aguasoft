#!/bin/sh
docker run --rm -v aguasoft_db:/vol -w /vol keinos/sqlite3 sh -c 'sqlite3 -readonly db.sqlite ".backup /tmp/db" && cat /tmp/db'
