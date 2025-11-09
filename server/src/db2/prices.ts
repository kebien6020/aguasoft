import { Prices } from '../db/models.js'
import { db } from './db.js'

export type PriceCompact = Omit<Prices, 'priceSetId' | 'createdAt' | 'updatedAt'>

export const insert = db.prepare(`
  INSERT INTO Prices (name, productId, clientId, value, priceSetId, createdAt, updatedAt)
  VALUES (:name, :productId, :clientId, :value, :priceSetId, :createdAt, :updatedAt)
`)

export const listByPriceSetId = db.prepare<[string], PriceCompact>(`
  SELECT name, productId, clientId, value
  FROM Prices
  WHERE priceSetId = ?
`)

export const deletePricesForPriceSet = db.prepare<{ priceSetId: string }>(`
  DELETE FROM Prices
  WHERE priceSetId = :priceSetId
`)
