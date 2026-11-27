#!/bin/bash
set -e

clickhouse-client \
  --user "$CLICKHOUSE_USER" \
  --password "$CLICKHOUSE_PASSWORD" \
  --multiquery <<SQL
CREATE USER IF NOT EXISTS grafana_reader
IDENTIFIED BY '${GRAFANA_DB_PASSWORD}';

GRANT SELECT ON otel.* TO grafana_reader;
SQL
