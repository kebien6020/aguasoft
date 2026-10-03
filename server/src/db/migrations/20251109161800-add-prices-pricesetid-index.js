export async function up({ context: { queryInterface } }) {
  await queryInterface.addIndex('Prices', ['priceSetId'])
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.removeIndex('Prices', ['priceSetId'])
}
