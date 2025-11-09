import { db } from './db.js'

export interface PriceSet {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface PriceSetCompact {
  id: number
  name: string
}

export const insert = db.prepare(`
  INSERT INTO PriceSets (name, createdAt, updatedAt) VALUES (:name, :createdAt, :updatedAt)
`)

export const list = db.prepare<[], PriceSetCompact>(`
  SELECT
    id, name
  FROM PriceSets
  WHERE deletedAt IS NULL
  ORDER BY id ASC
`)

export const detail = db.prepare<{ id: string }, PriceSetCompact>(`
  SELECT id, name
  FROM priceSets
  WHERE deletedAt is NULL
    AND id = :id
`)

export const updateName = db.prepare<{ id: string; name: string; updatedAt: string }>(`
  UPDATE PriceSets
  SET name = :name, updatedAt = :updatedAt
  WHERE id = :id
`)

export const softDelete = db.prepare<{ id: string; deletedAt: string }>(`
  UPDATE PriceSets
  SET deletedAt = :deletedAt
  WHERE id = :id
`)
