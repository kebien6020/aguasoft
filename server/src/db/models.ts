import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
} from '@sequelize/core'
import { sequelize } from './sequelize.js'

const {
  STRING,
  ENUM,
  INTEGER,
  DATE,
  DATEONLY,
  BOOLEAN,
  TEXT,
  FLOAT,
} = DataTypes

export class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
  declare id: CreationOptional<number>
  declare name: string
  declare code: string
  declare password: string
  declare role: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>
}

Users.init({
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: STRING, allowNull: false },
  code: { type: STRING, allowNull: false },
  password: { type: STRING, allowNull: false },
  role: {
    type: ENUM('seller', 'admin'),
    allowNull: false,
    defaultValue: 'seller',
  },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
},
{
  sequelize,
  paranoid: true,
  name: {
    singular: 'User',
    plural: 'Users',
  },
})

export class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
  declare sid: string
  declare userId: string
  declare expires: Date
  declare data: string
}

Session.init({
  sid: { type: STRING, primaryKey: true },
  userId: STRING,
  expires: DATE,
  data: STRING(50000),
}, {
  sequelize,
  timestamps: false,
  tableName: 'Sessions',
  name: {
    singular: 'Session',
    plural: 'Sessions',
  },
})

export class Sells extends Model<InferAttributes<Sells>, InferCreationAttributes<Sells>> {
  declare id: CreationOptional<number>
  declare date: string
  declare cash: boolean
  declare priceOverride: number | null
  declare quantity: number
  declare value: number
  declare userId: number
  declare clientId: number
  declare productId: number
  declare batchId: number | null
  declare productVariantId: number | null
  declare movementIds: number[] | null
  declare deleted: CreationOptional<boolean>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Possible inclussions
  declare Product?: NonAttribute<Products>
  declare Variant?: NonAttribute<ProductVariants>
  declare Client?: NonAttribute<Clients>
  declare Batch?: NonAttribute<Batches>
  declare User?: NonAttribute<Users>
}

Sells.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DATEONLY, allowNull: false },
  cash: { type: BOOLEAN, allowNull: false, defaultValue: false },
  priceOverride: { type: FLOAT, allowNull: true, defaultValue: null },
  quantity: { type: INTEGER, allowNull: false },
  value: { type: FLOAT, allowNull: false },
  userId: { type: INTEGER, allowNull: false },
  clientId: { type: INTEGER, allowNull: false },
  productId: { type: INTEGER, allowNull: false },
  batchId: { type: INTEGER, allowNull: true, defaultValue: null },
  productVariantId: { type: INTEGER, allowNull: true, defaultValue: null },
  movementIds: {
    type: STRING,
    allowNull: true,
    defaultValue: null,
    get() {
      const val = this.getDataValue('movementIds') as string | null
      return JSON.parse(val ?? 'null')
    },
    set(value: number[] | null) {
      if (value === null) {
        this.setDataValue('movementIds', null)
        return
      }
      this.setDataValue('movementIds', JSON.stringify(value))
    },

  },
  deleted: { type: BOOLEAN, allowNull: false, defaultValue: false },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'Sell',
    plural: 'Sells',
  },
})


export class Products extends Model<InferAttributes<Products>, InferCreationAttributes<Products>> {
  declare id: CreationOptional<number>
  declare name: string
  declare code: string
  declare basePrice: number
  declare batchCategoryId: number

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Possible inclussions
  declare Variants?: NonAttribute<ProductVariants[]>
}

Products.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: STRING, allowNull: false },
  code: { type: STRING, allowNull: false },
  basePrice: { type: FLOAT, allowNull: false },
  batchCategoryId: { type: INTEGER, allowNull: true },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'Product',
    plural: 'Products',
  },
})


export class ProductVariants extends Model<InferAttributes<ProductVariants>, InferCreationAttributes<ProductVariants>> {
  declare id: CreationOptional<number>
  declare productId: number
  declare code: string
  declare name: string
  declare basePrice: string | null

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Possible inclussions
  declare Product?: NonAttribute<Products>
}

ProductVariants.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: STRING, allowNull: false },
  name: { type: STRING, allowNull: false },
  basePrice: { type: FLOAT, allowNull: true },
  productId: {
    type: INTEGER,
    references: {
      table: 'Products',
      key: 'id',
    },
    allowNull: false,
  },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  name: {
    singular: 'ProductVariant',
    plural: 'ProductVariants',
  },
})


export class Clients extends Model<InferAttributes<Clients>, InferCreationAttributes<Clients>> {
  declare id: CreationOptional<number>
  declare name: string
  declare code: string
  // Deafult for the UI selection of "this client pays in cash"
  declare defaultCash: boolean
  declare hidden: boolean
  declare notes: string | null
  declare priceSetId: number | null

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Clients.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: STRING, allowNull: false },
  code: { type: STRING, allowNull: false },
  defaultCash: { type: BOOLEAN, allowNull: false, defaultValue: true },
  hidden: { type: BOOLEAN, allowNull: false, defaultValue: false },
  notes: { type: TEXT, defaultValue: null },
  priceSetId: { type: INTEGER, allowNull: true, defaultValue: null },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'Client',
    plural: 'Clients',
  },
})


export class BatchCategories extends Model<InferAttributes<BatchCategories>, InferCreationAttributes<BatchCategories>> {
  declare id: CreationOptional<number>
  declare code: string
  declare name: string
  declare expirationDays: number

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>
}

BatchCategories.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: STRING, allowNull: false, unique: true },
  name: { type: STRING, allowNull: false },
  expirationDays: { type: INTEGER, allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  name: {
    singular: 'BatchCategory',
    plural: 'BatchCategories',
  },
})


export class Batches extends Model<InferAttributes<Batches>, InferCreationAttributes<Batches>> {
  declare id: CreationOptional<number>
  declare code: string
  declare date: Date
  declare expirationDate: Date
  declare batchCategoryId: number

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Possible inclusions
  declare BatchCategory?: NonAttribute<BatchCategories>
}

Batches.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: STRING, allowNull: false },
  date: { type: DATEONLY, allowNull: false },
  expirationDate: { type: DATEONLY, allowNull: false },
  batchCategoryId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'BatchCategories',
      key: 'id',
    },
  },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'Batch',
    plural: 'Batches',
  },
})

export class Prices extends Model<InferAttributes<Prices>, InferCreationAttributes<Prices>> {
  declare id: CreationOptional<number>
  declare value: number
  declare clientId: number
  declare productId: number
  declare priceSetId: number | null
  declare name: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Prices.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: { type: FLOAT, allowNull: false },
  name: { type: STRING, allowNull: false, defaultValue: 'Base' },
  clientId: { type: INTEGER, allowNull: true },
  productId: { type: INTEGER, allowNull: false },
  priceSetId: { type: INTEGER, allowNull: true },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'Price',
    plural: 'Prices',
  },
})


export class Payments extends Model<InferAttributes<Payments>, InferCreationAttributes<Payments>> {
  declare id: CreationOptional<number>
  declare value: string
  declare clientId: number
  declare userId: number
  declare date: Date
  declare dateFrom: Date
  declare dateTo: Date
  declare invoiceNo: string
  declare invoiceDate: Date
  declare directPayment: boolean

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>
}

Payments.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: { type: FLOAT, allowNull: false },
  clientId: { type: INTEGER, allowNull: false },
  userId: { type: INTEGER, allowNull: false },
  date: { type: DATE, allowNull: false },
  dateFrom: { type: DATEONLY, allowNull: true },
  dateTo: { type: DATEONLY, allowNull: true },
  invoiceNo: { type: STRING, allowNull: true },
  invoiceDate: { type: DATEONLY, allowNull: true },
  directPayment: { type: BOOLEAN, allowNull: false, defaultValue: true },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  validate: {
    bothDatesOrNone() {
      if ((this.dateFrom === null) !== (this.dateTo === null))
        throw new Error('Specify both dates or neither')

    },
  },
  name: {
    singular: 'Payment',
    plural: 'Payments',
  },
})


export class Spendings extends Model<InferAttributes<Spendings>, InferCreationAttributes<Spendings>> {
  declare id: CreationOptional<number>
  // The date the spending was performed
  declare date: Date
  declare description: string
  declare value: string
  // Whether this was paid out of cash
  declare fromCash: boolean
  // Whether this is a transfer to our bank account
  declare isTransfer: boolean
  declare userId: number

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // Possible inclusions
  declare user?: NonAttribute<Users>

  // Methods added when performing associations
  declare getUser: BelongsToGetAssociationMixin<Users>
  declare setUser: BelongsToSetAssociationMixin<Users, number>
}

Spendings.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DATE, allowNull: false },
  description: { type: STRING, allowNull: false },
  value: { type: FLOAT, allowNull: false },
  fromCash: { type: BOOLEAN, allowNull: false, defaultValue: true },
  isTransfer: { type: BOOLEAN, allowNull: false, defaultValue: false },
  userId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'Users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  name: {
    singular: 'Spending',
    plural: 'Spendings',
  },
})

export class BalanceVerifications
  extends Model<InferAttributes<BalanceVerifications>, InferCreationAttributes<BalanceVerifications>> {

  declare id: CreationOptional<number>
  declare date: string
  declare createdById: number
  declare adjustAmount: number
  declare amount: number

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Posible inclusions
  declare createdBy?: NonAttribute<Users>
}

BalanceVerifications.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DATEONLY, allowNull: false },
  adjustAmount: { type: FLOAT, allowNull: false },
  amount: { type: FLOAT, allowNull: false },
  createdById: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'Users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'BalanceVerification',
    plural: 'BalanceVerifications',
  },
})

export class Storages extends Model<InferAttributes<Storages>, InferCreationAttributes<Storages>> {
  declare id: CreationOptional<number>
  declare code: string
  declare name: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>
}

Storages.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: STRING, allowNull: false, unique: true },
  name: { type: STRING, allowNull: false },

  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  name: {
    singular: 'Storage',
    plural: 'Storages',
  },
})

export class InventoryElements
  extends Model<InferAttributes<InventoryElements>, InferCreationAttributes<InventoryElements>> {

  declare id: CreationOptional<number>
  declare code: string
  declare name: string
  declare type: 'raw' | 'product' | 'tool'

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>
}

InventoryElements.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: STRING, allowNull: false, unique: true },
  name: { type: STRING, allowNull: false },
  type: { type: ENUM('raw', 'product', 'tool'), allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  name: {
    singular: 'InventoryElement',
    plural: 'InventoryElements',
  },
})

export class StorageStates extends Model<InferAttributes<StorageStates>, InferCreationAttributes<StorageStates>> {
  declare storageId: number
  declare inventoryElementId: number
  declare quantity: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Possible inclusions
  declare Storage?: NonAttribute<Storages>
  declare InventoryElement?: NonAttribute<InventoryElements>

  // Methods added when performing associations
  declare getStorage: BelongsToGetAssociationMixin<Storages>
  declare setStorage: BelongsToSetAssociationMixin<Storages, number>
  declare getInventoryElement: BelongsToGetAssociationMixin<InventoryElements>
  declare setInventoryElement: BelongsToSetAssociationMixin<InventoryElements, number>
}

StorageStates.init({
  storageId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'Storages',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    primaryKey: true,
  },
  inventoryElementId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    primaryKey: true,
  },
  quantity: { type: FLOAT, allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'StorageState',
    plural: 'StorageStates',
  },
})

export class InventoryMovements
  extends Model<InferAttributes<InventoryMovements>, InferCreationAttributes<InventoryMovements>> {

  declare id: CreationOptional<number>
  declare storageFromId: number | null
  declare storageToId: number | null
  declare inventoryElementFromId: number
  declare inventoryElementToId: number
  declare quantityFrom: string | number // decimal
  declare quantityTo: string | number // decimal
  declare cause:
    'manual'
    | 'in'
    | 'relocation'
    | 'production'
    | 'sell'
    | 'damage'
  declare createdBy: number
  declare rollback: boolean

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // soft deletion
  declare deletedAt: CreationOptional<Date | null>
  declare deletedBy: CreationOptional<number | null>

  // Possible inclusions
  declare storageFrom?: NonAttribute<Storages>
  declare storageTo?: NonAttribute<Storages>
  declare inventoryElementFrom?: NonAttribute<InventoryElements>
  declare inventoryElementTo?: NonAttribute<InventoryElements>
  declare creator?: NonAttribute<Users>
  declare deletor?: NonAttribute<Users>

  // Methods added when performing associations
  declare getStorageFrom: BelongsToGetAssociationMixin<Storages>
  declare setStorageFrom: BelongsToSetAssociationMixin<Storages, number>
  declare getStorageTo: BelongsToGetAssociationMixin<Storages>
  declare setStorageTo: BelongsToSetAssociationMixin<Storages, number>
  declare getInventoryElementFrom: BelongsToGetAssociationMixin<InventoryElements>
  declare setInventoryElementFrom: BelongsToSetAssociationMixin<InventoryElements, number>
  declare getInventoryElementTo: BelongsToGetAssociationMixin<InventoryElements>
  declare setInventoryElementTo: BelongsToSetAssociationMixin<InventoryElements, number>
  declare getCreator: BelongsToGetAssociationMixin<Users>
  declare setCreator: BelongsToSetAssociationMixin<Users, number>
  declare getDeletor: BelongsToGetAssociationMixin<Users>
  declare setDeletor: BelongsToSetAssociationMixin<Users, number>
}

InventoryMovements.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  storageFromId: {
    type: INTEGER,
    allowNull: true,
    references: {
      table: 'Storages',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  storageToId: {
    type: INTEGER,
    allowNull: true,
    references: {
      table: 'Storages',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  inventoryElementFromId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  inventoryElementToId: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  quantityFrom: { type: FLOAT, allowNull: false },
  quantityTo: { type: FLOAT, allowNull: false },
  cause: {
    type: ENUM(
      'manual',
      'in',
      'relocation',
      'production',
      'sell',
      'damage',
    ),
    allowNull: false,
  },
  rollback: { type: BOOLEAN, allowNull: false, defaultValue: false },
  createdBy: {
    type: INTEGER,
    allowNull: false,
    references: {
      table: 'Users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  deletedBy: {
    type: INTEGER,
    allowNull: true,
    references: {
      table: 'Users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
  validate: {
    noOmitDeletedBy() {
      if (this.deletedAt !== null && this.deletedBy === null)
        throw new Error('Trying to delete a movement without specifying deletedBy')

    },
  },
  name: {
    singular: 'InventoryMovement',
    plural: 'InventoryMovements',
  },
})

export class MachineCounters extends Model<InferAttributes<MachineCounters>, InferCreationAttributes<MachineCounters>> {
  declare id: CreationOptional<number>
  declare value: string
  declare type: 'production' | 'new-reel'

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

MachineCounters.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: {
    type: STRING,
    allowNull: false,
  },
  type: { type: ENUM('production', 'new-reel'), allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
}, {
  sequelize,
  name: {
    singular: 'MachineCounter',
    plural: 'MachineCounters',
  },
})

// View based on aggregations over the sales and payments tables
export class ClientBalances extends Model<InferAttributes<ClientBalances>, InferCreationAttributes<ClientBalances>> {
  declare clientId: number
  declare totalSales: number
  declare totalPayments: number
  declare balance: number
  declare lastSaleDate: Date | null
}

ClientBalances.init({
  clientId: INTEGER,
  totalSales: INTEGER,
  totalPayments: INTEGER,
  balance: INTEGER,
  lastSaleDate: DATE,
}, {
  sequelize,
  timestamps: false,
  noPrimaryKey: true,
  name: {
    singular: 'ClientBalance',
    plural: 'ClientBalances',
  },
})

// Associations
Sells.belongsTo(Users, { as: 'User', inverse: { type: 'hasMany', as: 'Sells' } })
Sells.belongsTo(Clients, { as: 'Client', inverse: { type: 'hasMany', as: 'Sells' } })
Sells.belongsTo(Products, { as: 'Product', inverse: { type: 'hasMany', as: 'Sells' } })
Sells.belongsTo(Batches, { as: 'Batch', inverse: { type: 'hasMany', as: 'Sells' } })
Sells.belongsTo(ProductVariants, { as: 'Variant', inverse: { type: 'hasMany', as: 'Sells' } })
Sells.hasOne(Prices, { as: 'BasePrice' }) // Intended to be used with custom `on` in the query

ProductVariants.belongsTo(Products, { as: 'Product', inverse: { type: 'hasMany', as: 'Variants' } })

Products.belongsTo(BatchCategories, { as: 'BatchCategory', inverse: { type: 'hasMany', as: 'Products' } })

Batches.belongsTo(BatchCategories, { as: 'BatchCategory', inverse: { type: 'hasMany', as: 'Batches' } })

Prices.belongsTo(Clients, { as: 'Client', inverse: { type: 'hasMany', as: 'Prices' } })
Prices.belongsTo(Products, { as: 'Product', inverse: { type: 'hasMany', as: 'Prices' } })

Payments.belongsTo(Clients, { as: 'Client', inverse: { type: 'hasMany', as: 'Payments' } })
Payments.belongsTo(Users, { as: 'User', inverse: { type: 'hasMany', as: 'Payments' } })

Spendings.belongsTo(Users, { as: 'User' })

BalanceVerifications.belongsTo(Users, { as: 'createdBy', foreignKey: 'createdById', inverse: { type: 'hasMany', as: 'CreatedBalanceVerifications' } })

StorageStates.belongsTo(Storages, { as: 'Storage', inverse: { type: 'hasMany', as: 'StorageStates' } })
StorageStates.belongsTo(InventoryElements, { as: 'InventoryElement', inverse: { type: 'hasMany', as: 'StorageStates' } })

InventoryMovements.belongsTo(Storages, { as: 'storageFrom', inverse: { type: 'hasMany', as: 'InventoryMovementsFrom' } })
InventoryMovements.belongsTo(Storages, { as: 'storageTo', inverse: { type: 'hasMany', as: 'InventoryMovementsTo' } })
InventoryMovements.belongsTo(InventoryElements, { as: 'inventoryElementFrom', inverse: { type: 'hasMany', as: 'InventoryMovementsFrom' } })
InventoryMovements.belongsTo(InventoryElements, { as: 'inventoryElementTo', inverse: { type: 'hasMany', as: 'InventoryMovementsTo' } })
InventoryMovements.belongsTo(Users, { as: 'creator', foreignKey: 'createdBy', inverse: { type: 'hasMany', as: 'CreatedInventoryMovements' } })
InventoryMovements.belongsTo(Users, { as: 'deletor', foreignKey: 'deletedBy', inverse: { type: 'hasMany', as: 'DeletedInventoryMovements' } })

ClientBalances.belongsTo(Clients, { as: 'Client', foreignKey: 'clientId', inverse: { type: 'hasMany', as: 'ClientBalances' } })
