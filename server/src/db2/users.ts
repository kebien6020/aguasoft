import { db } from './db.js'

export const userRoleStmt = db.prepare<{ id: number }, { role: string }>(`
  SELECT role
  FROM Users
  WHERE id = :id
`)

