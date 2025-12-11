import { AccountRepository } from "@/domain/AccountRepository"
import { Account } from "@/domain/Account"


export class InMemoryAccountRepository implements AccountRepository {
  private storage: Map<string, Account> = new Map()

  async findById(id: string): Promise<Account | null> {

    const account = this.storage.get(id)
    return account ? new Account(account.id, account.balance, account.version) : null
  }

  async save(account: Account): Promise<void> {
    this.storage.set(
      account.id,
      new Account(account.id, account.balance, account.version)
    )
  }

  seed(account: Account) {
    this.storage.set(
      account.id,
      new Account(account.id, account.balance, account.version)
    )
  }
}
