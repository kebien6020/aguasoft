// @ts-check
'use strict'

const products = [
  { name: 'Paca 360', code: '001', basePrice: 2900 },
  { name: 'Bolsa 6L', code: '002', basePrice: 1900 },
  { name: 'Botellon', code: '003', basePrice: 5000 },
  { name: 'Hielo 5Kg', code: '004', basePrice: 5000 },
  { name: 'Botellon Nuevo', code: '005', basePrice: 36000 },
  { name: 'Base Botellon', code: '006', basePrice: 18000 },
  { name: 'Hielo 2Kg', code: '007', basePrice: 2500 },
  { name: 'Botella 600ml', code: '008', basePrice: 1125 },
  { name: 'Bolsa 360 Congelada', code: '009', basePrice: 400 },
  { name: 'Bomba eléctrica para Botellón', code: '010', basePrice: 30000 },
  { name: 'Barra de Hielo', code: '011', basePrice: 1000 },
]

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} _Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, _Sequelize) => {
    for (const product of products) {

      /** @type {{id: string}[]} */
      const existing = await queryInterface.sequelize.query('SELECT id FROM "Products" WHERE name = ?', {
        raw: true,
        replacements: [product.name],
        type: 'SELECT',
      })
      if (existing.length !== 0)
        continue // already exists

      const sql = 'INSERT INTO "Products" (name, code, basePrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
      const now = new Date()
      await queryInterface.sequelize.query(sql, {
        replacements: [product.name, product.code, product.basePrice, now, now],
      })
    }
  },
  /**
   * @param {import('sequelize').QueryInterface} _queryInterface
   * @return {Promise<void>}
   */
  down: async (_queryInterface) => {
  },
}
