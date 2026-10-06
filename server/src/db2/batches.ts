import { AppError } from '../routes/utils.js'
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

type BatchesIncludeable = 'BatchCategory'
type ListBatchesInput = {
  offset: number
  limit: number
  include: BatchesIncludeable[]
  batchCategoryId?: number
}
type ListBatchesRow = {
  id: number
  code: string
  date: string
  expirationDate: string
  createdAt: string
  updatedAt: string

  batchCategoryId?: number
  batchCategoryName?: string
  batchCategoryCode?: string
}
export const listBatches = ({ offset, limit, include, batchCategoryId }: ListBatchesInput) => {
  const t1 = time('ListBatches')
  const t2 = time('ListBatchesPrepare')
  const includeCategory = include.includes('BatchCategory')
  const listBatchesStmt = db.prepare<{limit: number, offset: number, batchCategoryId?: number}, ListBatchesRow>(`
  SELECT
    B.id,
    B.code,
    B.date,
    B.expirationDate,
    ${includeCategory ? `
    BC.id as batchCategoryId,
    BC.name as batchCategoryName,
    BC.code as batchCategoryCode,
    ` : ''}
    B.createdAt,
    B.updatedAt
  FROM Batches as B
  ${includeCategory ? `
  LEFT JOIN BatchCategories as BC
    ON B.batchCategoryId = BC.id
  ` : ''}
  ${batchCategoryId !== undefined ? `
  WHERE B.batchCategoryId = :batchCategoryId
  ` : ''}
  ORDER BY B.createdAt DESC
  LIMIT :limit
  OFFSET :offset
  `)
  t2()

  const t3 = time('ListBatchesQuery')
  const rows = listBatchesStmt.all({ limit, offset, batchCategoryId })
  t3()

  const t4 = time('ListBatchesMassage')
  const batches = rows.map(r => {
    const BatchCategory = includeCategory
      ? {
        id: r.batchCategoryId!,
        name: r.batchCategoryName!,
        code: r.batchCategoryCode!,
      } : undefined

    return {
      id: r.id,
      code: r.code,
      date: r.date,
      expirationDate: r.expirationDate,
      BatchCategory,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }
  })
  t4()

  t1()
  return batches
}

type CountBatchesInput = {
  batchCategoryId?: number
}
export const countBatches = ({ batchCategoryId }: CountBatchesInput) => {
  const t1 = time('CountBatches')
  const t2 = time('CountBatchesPrepare')
  const countBatchesStmt = db.prepare<{batchCategoryId?: number}, {count: number}>(`
  SELECT count(*) as count
  FROM Batches
  ${batchCategoryId !== undefined ? `
  WHERE batchCategoryId = :batchCategoryId
  ` : ''}
  `)
  t2()

  const row = countBatchesStmt.get({ batchCategoryId })
  if (!row)
    throw new AppError('Error counting batches')

  t1()
  return row.count
}
