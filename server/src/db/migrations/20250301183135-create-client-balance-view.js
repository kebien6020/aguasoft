// @ts-check
import { QueryTypes } from 'sequelize'

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, _Sequelize) {
  await queryInterface.sequelize.query(`
    create view ClientBalances as
    select
      client_id as clientId,
      sales as totalSales,
      payments as totalPayments,
      (sales - payments) as balance,
      last_sale as lastSaleDate
    from
      (select
        client_id,
        client_name,
        sales,
        last_sale,
        coalesce(sum(Payments.value), 0) as payments
       from (
          select
            Clients.id as client_id,
            Clients.name as client_name,
            coalesce(sum(Sells.value), 0) as sales,
            max(Sells.updatedAt) as last_sale
          from Clients
          left join Sells
            on Clients.id = Sells.clientId
            and Sells.cash = false
            and Sells.deleted = 0
          where
            Clients.hidden = 0
          group by client_id
       )
       left join Payments
         on client_id = Payments.clientId
         and Payments.deletedAt is null
       group by client_id
      )
    where abs(sales - payments) > 0.1
    order by balance desc
  `, {
    type: QueryTypes.RAW,
    raw: true,
  })

}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.sequelize.query('drop view ClientBalances', {
    type: QueryTypes.RAW,
    raw: true,
  })
}
