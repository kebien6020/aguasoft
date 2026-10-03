export async function up({ context: { queryInterface } }) {
  const now = new Date
  await queryInterface.bulkInsert('BatchCategories', [
    {
      code: 'bolsa-360',
      name: 'Bolsa/Paca de 360ml',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'bolsa-6l',
      name: 'Bolsa 6L',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'botellon',
      name: 'Botellón',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'hielo-5kg',
      name: 'Hielo 5Kg',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'botellon-nuevo',
      name: 'Botellón Nuevo',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'hielo-2kg',
      name: 'Hielo 2Kg',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: 'barra-hielo',
      name: 'Barra de Hielo',
      expirationDays: 45,
      createdAt: now,
      updatedAt: now,
    },
  ])
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.bulkDelete('BatchCategories', {})
}
