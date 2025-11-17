import { MakeRequired } from './utils/types'

export interface Product {
  id: number
  name: string
  code: string
  basePrice: string
  batchCategoryId?: number | null

  Variants?: Variant[]
}

export type ProductWithBatchCategory = MakeRequired<Product, 'batchCategoryId'>

export interface Variant {
  id: number
  productId: number
  code: string
  name: string
  basePrice: number | null
  ProductId: number

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Price {
  id: number
  value: string
  clientId: number
  productId: number
  name: string
}

export interface User {
  id: number
  name: string
  code: string
  role: string
}

export interface Client {
  id: number
  name: string
  code: string
  defaultCash: boolean
  hidden: boolean
  priceSetId?: number
}

export interface Payment {
  id: number
  value: number
  Client: {
    id: number
    name: string
  }
  User: {
    id: number
    name: string
  }
  date: string
  dateFrom: string | null
  dateTo: string | null
  invoiceNo: string | null
  invoiceDate: string | null
  directPayment: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Spending {
  id: number
  // The date the spending was performed
  date: string

  description: string

  value: string
  // Whether this was paid out of cash
  fromCash: boolean
  // Whether this is a transfer to our bank account
  isTransfer: boolean
  // timestamps
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Possible inclusions
  User: {
    name: string
    code: string
  }
}

export interface Storage {
  id: number
  code: string
  name: string

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface InventoryElement {
  id: number
  code: string
  name: string
  type: 'raw' | 'product' | 'tool'

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface StorageState {
  readonly storageId: number
  readonly inventoryElementId: number
  readonly quantity: string

  // timestamps
  createdAt: string
  updatedAt: string

  // Possible inclusions
  Storage?: Storage
  InventoryElement?: InventoryElement
}

export interface InventoryMovement {
  readonly id: number
  readonly storageFromId: number | null
  readonly storageToId: number | null
  readonly inventoryElementFromId: number
  readonly inventoryElementToId: number
  readonly quantityFrom: string
  readonly quantityTo: string
  readonly cause:
  'manual'
  | 'in'
  | 'relocation'
  | 'production'
  | 'sell'
  | 'damage'
  readonly createdBy: number
  readonly rollback: boolean

  // timestamps
  readonly createdAt: Date
  readonly updatedAt: Date

  // soft deletion
  readonly deletedAt: Date | null
  readonly deletedBy: number | null

  // Possible inclusions
  readonly storageFrom?: Storage | null
  readonly storageTo?: Storage | null
  readonly inventoryElementFrom?: InventoryElement
  readonly inventoryElementTo?: InventoryElement
  readonly creator?: User
  readonly deletor?: User
}

export interface MachineCounter {
  readonly id: number
  readonly value: number
  readonly type: 'production' | 'new-reel'

  readonly createdAt: string
  readonly updatedAt: string
}

export interface BalanceVerification {
  readonly id: number
  readonly date: string
  readonly createdById: number
  readonly adjustAmount: number
  readonly amount: number

  // Posible inclusions
  readonly createdBy?: User

  // Timestamps
  readonly createdAt: string
  readonly updatedAt: string
}

export interface Sell {
  readonly id: number
  readonly date: string
  readonly cash: boolean
  readonly priceOverride: number
  readonly quantity: number
  readonly value: number
  readonly userId: number
  readonly clientId: number
  readonly productId: number
  readonly deleted: boolean

  // Possible inclussions
  readonly Product?: Product
  readonly Client?: Client
  readonly User?: User
}

export type BalanceItem = {
  readonly balance: number
  readonly date: string
  readonly sales: number
  readonly spendings: number
  readonly payments: number
  readonly verification?: BalanceVerification
}

export interface BatchCategory {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly expirationDays: number
}

export interface Batch {
  readonly id: number
  readonly code: string
  readonly date: Date
  readonly expirationDate: Date
  readonly batchCategoryId: number

  readonly BatchCategory?: BatchCategory
}

export interface CreditBalanceItem {
  readonly clientId: number
  readonly totalSales: number
  readonly totalPayments: number
  readonly balance: number
  readonly lastSaleDate: Date | null

  readonly Client?: Client
}

export interface PriceSet {
  readonly id: number
  readonly name: string

  readonly createdAt: string
  readonly updatedAt: string
}
