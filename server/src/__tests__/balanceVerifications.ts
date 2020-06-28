import models from '../db/models'
import createBalanceVerification from '../db/factories/balanceVerifications'
import createUser from '../db/factories/users'

const {
  BalanceVerifications,
  Users,
} = models

afterEach(async () => {
  await Promise.all([
    Users.truncate({ cascade: true }),
    BalanceVerifications.truncate({ cascade: true }),
  ])
})

describe('Model', () => {

  it('migration has run', async () => {
    const logger = jest.fn((sql) => {
      expect(sql).toMatchInlineSnapshot(
        '"Executing (default): SELECT `id`, `date`, `createdById`, `adjustAmount`, `amount` FROM `BalanceVerifications` AS `BalanceVerifications` LIMIT 1;"'
      )
    })

    const promise = BalanceVerifications.findOne({
      attributes: [
        'id',
        'date',
        'createdById',
        'adjustAmount',
        'amount',
      ],
      logging: logger,
    })

    expect(promise).toResolve()

    await promise

    expect(logger).toHaveBeenCalled()
  })

  const setup = async () => {
    const user = await createUser()
    const verification = await createBalanceVerification({ createdById: user.id })
    return { user, verification } as const
  }

  it('retrieves the amounts as numbers', async () => {
    const { verification } = await setup()

    expect(verification.amount).toBeNumber()
    expect(verification.adjustAmount).toBeNumber()
  })

  it('allows getting the creator', async () => {
    const { verification } = await setup()
    await verification.reload({ include: ['createdBy'] })

    expect(verification.createdBy).toBeInstanceOf(Users)
  })

})
