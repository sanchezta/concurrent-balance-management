import { AccountNotFoundError } from "../domain/AccountErrors"
import { AccountRepository } from "../domain/AccountRepository"
import { ConcurrencyEngine } from "../infrastructure/ConcurrencyEngine"
import { MaxRetriesExceededError } from "./UpdateBalanceErrors"

export type TransactionType = "deposit" | "withdraw"

export class UpdateBalance {
  constructor(
    private readonly repo: AccountRepository,
    private readonly concurrency: ConcurrencyEngine,
    private readonly maxRetries: number = 5
  ) { }

  async execute(accountId: string, amount: number, type: TransactionType) {
    let attempts = 0

    while (attempts < this.maxRetries) {
      const account = await this.repo.findById(accountId)

      if (!account) throw new AccountNotFoundError(accountId)

      const originalVersion = account.version

      if (type === "deposit") account.deposit(amount)
      if (type === "withdraw") account.withdraw(amount)

      const success = await this.concurrency.atomicSave(
        this.repo,
        account,
        originalVersion
      )

      if (success) return account
      attempts++
    }

    throw new MaxRetriesExceededError(this.maxRetries)
  }
}
