import { InferAttributes } from 'sequelize'
import { Prices } from '../db/models.js'
import { db } from './db.js'

export type PriceCompact = Omit<InferAttributes<Prices>, 'priceSetId' | 'clientId' | 'createdAt' | 'updatedAt'>

export const insert = db.prepare(`
  INSERT INTO Prices (name, productId, clientId, value, priceSetId, createdAt, updatedAt)
  VALUES (:name, :productId, :clientId, :value, :priceSetId, :createdAt, :updatedAt)
`)

export const listByPriceSetId = db.prepare<[number], PriceCompact>(`
  SELECT id, name, productId, value
  FROM Prices
  WHERE priceSetId = ?
`)

export const listByPriceSetIdProductId = db.prepare<{ priceSetId: number, productId: number }, PriceCompact>(`
  SELECT id, name, productId, value
  FROM Prices
  WHERE priceSetId = :priceSetId
  AND productId = :productId
`)

export const listByClientId = db.prepare<[number], PriceCompact>(`
  SELECT id, name, productId, value
  FROM Prices
  WHERE clientId = ?
`)

export const listByClientIdProductId = db.prepare<{ clientId: number, productId: number }, PriceCompact>(`
  SELECT id, name, productId, value
  FROM Prices
  WHERE clientId = :clientId
  AND productId = :productId
`)

export const deletePricesForPriceSet = db.prepare<{ priceSetId: number }>(`
  DELETE FROM Prices
  WHERE priceSetId = :priceSetId
`)
