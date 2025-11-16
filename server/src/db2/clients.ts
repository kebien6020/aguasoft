import { db } from './db.js'

type ClientPriceSetId = {
  id: string
  priceSetId: number | null
}

export const getForPriceModeStmt = db.prepare<{ id: number }, ClientPriceSetId>(`
  SELECT id, priceSetId
  FROM Clients
  WHERE id = :id
`)
