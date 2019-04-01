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
