import { Model, STRING, ENUM, INTEGER, DATE, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute, DATEONLY, BOOLEAN, DECIMAL, TEXT, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, BIGINT } from 'sequelize'
import { sequelize } from './sequelize.js'

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
  priceOverride: { type: DECIMAL(20, 8), allowNull: true, defaultValue: null },
  quantity: { type: INTEGER, allowNull: false },
  value: { type: DECIMAL(20, 8), allowNull: false },
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
      // @ts-expect-error Typing is wrong, it assumes that the underlying value
      // is the same type as the observed value
      this.setDataValue('movementIds', JSON.stringify(value))
    },

  },
  deleted: { type: BOOLEAN, allowNull: false, defaultValue: false },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })


export class Products extends Model<InferAttributes<Products>, InferCreationAttributes<Products>> {
  declare id: CreationOptional<number>
  declare name: string
  declare code: string
  declare basePrice: string
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
  basePrice: { type: DECIMAL(20, 8), allowNull: false },
  batchCategoryId: { type: INTEGER, allowNull: true },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })


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
  basePrice: { type: DECIMAL(20, 8), allowNull: true },
  productId: {
    type: INTEGER,
    references: {
      model: 'Products',
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
}, { sequelize })


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
      model: 'BatchCategories',
      key: 'id',
    },
  },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })


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
})


export class Prices extends Model<InferAttributes<Prices>, InferCreationAttributes<Prices>> {
  declare id: CreationOptional<number>
  declare value: string
  declare clientId: number
  declare productId: number
  declare priceSetId: number | null
  declare name: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Prices.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: { type: DECIMAL(20, 8), allowNull: false },
  name: { type: STRING, allowNull: false, defaultValue: 'Base' },
  clientId: { type: INTEGER, allowNull: true },
  productId: { type: INTEGER, allowNull: false },
  priceSetId: { type: INTEGER, allowNull: true },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })


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
}

Payments.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: { type: DECIMAL(20, 8), allowNull: false },
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
  value: { type: DECIMAL, allowNull: false },
  fromCash: { type: BOOLEAN, allowNull: false, defaultValue: true },
  isTransfer: { type: BOOLEAN, allowNull: false, defaultValue: false },
  userId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'restrict',
  },
  createdAt: DATE,
  updatedAt: DATE,
  deletedAt: DATE,
}, {
  sequelize,
  paranoid: true,
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
  adjustAmount: { type: DECIMAL(20, 8), allowNull: false },
  amount: { type: DECIMAL(20, 8), allowNull: false },
  createdById: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })

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
      model: 'Storages',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
    primaryKey: true,
  },
  inventoryElementId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
    primaryKey: true,
  },
  quantity: { type: DECIMAL(20, 8), allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })

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
      model: 'Storages',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  storageToId: {
    type: INTEGER,
    allowNull: true,
    references: {
      model: 'Storages',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  inventoryElementFromId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  inventoryElementToId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'InventoryElements',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  quantityFrom: { type: DECIMAL(20, 8), allowNull: false },
  quantityTo: { type: DECIMAL(20, 8), allowNull: false },
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
      model: 'Users',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  },
  deletedBy: {
    type: INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
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
})

export class MachineCounters extends Model<InferAttributes<MachineCounters>, InferCreationAttributes<MachineCounters>> {
  declare id: CreationOptional<number>
  declare value: number
  declare type: 'production' | 'new-reel'

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

MachineCounters.init({
  id: { type: INTEGER, autoIncrement: true, primaryKey: true },
  value: { type: BIGINT, allowNull: false },
  type: { type: ENUM('production', 'new-reel'), allowNull: false },
  createdAt: DATE,
  updatedAt: DATE,
}, { sequelize })

// View based on aggregations over the sales and payments tables
export class ClientBalances extends Model<InferAttributes<ClientBalances>, InferCreationAttributes<ClientBalances>> {
  declare clientId: number
  declare totalSales: number
  declare totalPayments: number
  declare balance: number
  declare lastSaleDate: Date | null
}

ClientBalances.init({
  // Not an actual primary key, but this is required because otherwise
  // sequelize assumes there's a column named 'id'
  clientId: { type: INTEGER, primaryKey: true },
  totalSales: INTEGER,
  totalPayments: INTEGER,
  balance: INTEGER,
  lastSaleDate: DATE,
}, {
  sequelize,
  timestamps: false,

})

// Associations
Sells.belongsTo(Users)
Sells.belongsTo(Clients)
Sells.belongsTo(Products)
Sells.belongsTo(Batches)
Sells.belongsTo(ProductVariants, {
  as: 'Variant',
  foreignKey: 'productVariantId',
})
Sells.hasOne(Prices, { as: 'BasePrice' }) // Intended to be used with custom `on` in the query

Products.hasMany(Sells)
Products.hasMany(ProductVariants, { as: 'Variants' })
Products.belongsTo(BatchCategories, { foreignKey: 'batchCategoryId' })

ProductVariants.belongsTo(Products)

Clients.hasMany(Sells)
Clients.hasMany(Prices, { foreignKey: 'clientId' })

Batches.belongsTo(BatchCategories)

Prices.belongsTo(Clients)
Prices.belongsTo(Products)

Payments.belongsTo(Clients)
Payments.belongsTo(Users)

Spendings.belongsTo(Users)

BalanceVerifications.belongsTo(Users, { as: 'createdBy', foreignKey: 'createdById' })

StorageStates.belongsTo(Storages)
StorageStates.belongsTo(InventoryElements)

InventoryMovements.belongsTo(Storages, { as: 'storageFrom' })
InventoryMovements.belongsTo(Storages, { as: 'storageTo' })
InventoryMovements.belongsTo(InventoryElements, { as: 'inventoryElementFrom' })
InventoryMovements.belongsTo(InventoryElements, { as: 'inventoryElementTo' })
InventoryMovements.belongsTo(Users, { as: 'creator', foreignKey: 'createdBy' })
InventoryMovements.belongsTo(Users, { as: 'deletor', foreignKey: 'deletedBy' })

ClientBalances.belongsTo(Clients, { as: 'Client', foreignKey: 'clientId' })
