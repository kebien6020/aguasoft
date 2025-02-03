// @ts-check
'use strict'

const mapping = {
  'Paca 360': 'bolsa-360',
  'Bolsa 6L': 'bolsa-6l',
  Botellon: 'botellon',
  'Hielo 5Kg': 'hielo-5kg',
  'Botellon Nuevo': 'botellon-nuevo',
  // 'Base Botellon': '',
  'Hielo 2Kg': 'hielo-2kg',
  // 'Botella 600ml': '',
  // 'Bolsa 360 Congelada': '',
  // 'Bomba eléctrica para Botellón': '',
  'Barra de Hielo': 'barra-hielo',
}

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, Sequelize) => {
    for (const [productName, batchCategoryCode] of Object.entries(mapping)) {

      /** @type {{id: string}[]} */
      const products = await queryInterface.sequelize.query('SELECT id FROM "Products" WHERE name = ?', {
        raw: true,
        replacements: [productName],
        type: 'SELECT',
      })
      if (products.length !== 1)
        throw new Error(`Product "${productName}" not found`)

      const product = products[0]

      /** @type {{id: string}[]} */
      const batchCategories = await queryInterface.sequelize.query('SELECT id FROM "BatchCategories" WHERE code = ?', {
        raw: true,
        replacements: [batchCategoryCode],
        type: 'SELECT',
      })
      if (batchCategories.length !== 1)
        throw new Error(`Batch category "${batchCategoryCode}" not found`)

      const batchCategory = batchCategories[0]

      await queryInterface.sequelize.query('UPDATE "Products" SET "batchCategoryId" = ? WHERE id = ?', {
        replacements: [batchCategory.id, product.id],
      })
    }
  },
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @return {Promise<void>}
   */
  down: async (queryInterface) => {
    for (const [productName] of Object.entries(mapping)) {
      await queryInterface.sequelize.query('UPDATE "Products" SET "batchCategoryId" = NULL WHERE name = ?', {
        replacements: [productName],
      })
    }

  },
}
