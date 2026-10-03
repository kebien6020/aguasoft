export default {
  development: {
    dialect: 'sqlite3',
    storage: 'db.sqlite',
    logQueryParameters: true,
  },
  test: {
    dialect: 'sqlite3',
    storage: 'db.test.sqlite',
    logQueryParameters: true,
  },
  production: {
    dialect: 'sqlite3',
    storage: '/db/db.sqlite',
    logQueryParameters: true,
  },
} as const
