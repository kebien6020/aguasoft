export async function up({ context: { queryInterface } }) {
  await queryInterface.addIndex('Sells', ['date', 'updatedAt'], {
    name: 'Sells_dates',
  })

  await queryInterface.addIndex('Prices', ['clientId', 'productId', 'name'], {
    name: 'Prices_client_product_name',
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.removeIndex('Sells', 'Sells_dates')
  await queryInterface.removeIndex('Prices', 'Prices_client_product_name')
}
