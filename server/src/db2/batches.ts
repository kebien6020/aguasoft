import { db, time } from './db.js'

type BatchDetailRow = {
  id: number
  code: string
  date: string
  expirationDate: string
  batchCategoryId: number
  batchCategoryName: string
  createdAt: string
  updatedAt: string
}

const batchDetailStmt = db.prepare<{ id: number }, BatchDetailRow>(`
SELECT
  B.id,
  B.code,
  B.date,
  B.expirationDate,
  BC.id as batchCategoryId,
  BC.name as batchCategoryName,
  B.createdAt,
  B.updatedAt
FROM Batches as B
LEFT JOIN BatchCategories as BC
  ON B.batchCategoryId = BC.id
WHERE B.id = :id
`)

export const getBatchDetail = (id: number) => {
  const t1 = time('GetBatchDetail')
  const t2 = time('GetBatchDetailQuery')
  const row = batchDetailStmt.get({ id })
  t2()
  if (!row)
    return undefined

  const batch = {
    id: row.id,
    code: row.code,
    date: new Date(row.date),
    expirationDate: new Date(row.expirationDate),
    BatchCategory: {
      id: row.batchCategoryId,
      name: row.batchCategoryName,
    },
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
  t1()
  return batch
}
