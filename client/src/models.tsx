export interface Product {
  id: number
  name: string
  code: string
  basePrice: string
}

export interface Price {
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
  readonly storageFrom?: Storage
  readonly storageTo?: Storage
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
