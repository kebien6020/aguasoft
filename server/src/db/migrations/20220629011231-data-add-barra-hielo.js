export async function up({ context: { queryInterface } }) {
  const now = new Date
  await queryInterface.bulkInsert('InventoryElements', [
    {
      code: 'barra-hielo',
      name: 'Barra de Hielo',
      type: 'product',
      createdAt: now,
      updatedAt: now,
    },
  ])
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.bulkDelete('InventoryElements', {
    code: 'barra-hielo',
  })
}
