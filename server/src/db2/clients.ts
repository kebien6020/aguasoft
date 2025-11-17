import { db } from './db.js'

type ClientPriceSetId = {
  id: string
  priceSetId: number | null
}

type ClientRow = {
  id: number
  name: string
  code: string
  defaultCash: 0 | 1
  hidden: 0 | 1
  notes?: string | null
  priceSetId?: number | null
}

export const getForPriceModeStmt = db.prepare<{ id: number }, ClientPriceSetId>(`
  SELECT id, priceSetId
  FROM Clients
  WHERE id = :id
`)

type ListClientsParams = {
  hidden?: boolean
  priceSetId?: number
  search?: string
}

export const listClientsStmt = db.prepare<ListClientsParams, ClientRow>(`
  SELECT id, name, code, defaultCash, hidden, notes, priceSetId
  FROM Clients
  WHERE (:hidden IS NULL OR hidden = :hidden)
    AND (:priceSetId IS NULL OR priceSetId = :priceSetId)
    AND (
      :search IS NULL
      OR name LIKE '%' || :search || '%'
      OR notes LIKE '%' || :search || '%'
      OR code LIKE '%' || :search || '%'
    )
  ORDER BY
    CASE WHEN code = '001' THEN 0 ELSE 1 END,
    name COLLATE NOCASE
`)
