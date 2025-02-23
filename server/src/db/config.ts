export default {
  development: {
    dialect: 'sqlite',
    storage: 'db.sqlite',
    logQueryParameters: true,
  },
  test: {
    dialect: 'sqlite',
    storage: 'db.test.sqlite',
    logQueryParameters: true,
  },
  production: {
    dialect: 'sqlite',
    storage: '/db/db.sqlite',
    logQueryParameters: true,
  },
} as const
