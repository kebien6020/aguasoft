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

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
