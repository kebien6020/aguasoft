# Starting from 26.x default clickhouse image requires avx2
# Unpin once they figure out releasing separate linux/amd64/vX images
FROM clickhouse/clickhouse-server:25.8

COPY init/ /docker-entrypoint-initdb.d/
