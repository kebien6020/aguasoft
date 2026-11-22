// @ts-check
/** @param {{context: {db: import('better-sqlite3').Database}}} arg */
export function up({ context: { db } }) {
  db.prepare('CREATE INDEX idx_batches_list ON Batches (createdAt DESC)').run()
  db.prepare('CREATE INDEX idx_batches_register_sale ON Batches (batchCategoryId, date DESC, createdAt DESC)').run()
}

/** @param {{context: {db: import('better-sqlite3').Database}}} arg */
export function down({ context: { db } }) {
  db.prepare('DROP INDEX idx_batches_register_sale').run()
  db.prepare('DROP INDEX idx_batches_list').run()
}
