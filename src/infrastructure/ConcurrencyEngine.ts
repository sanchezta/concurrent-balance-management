import { Account } from "@/domain/Account"
import { AccountRepository } from "@/domain/AccountRepository"
import { AccountNotFoundError } from "@/domain/AccountErrors"

export class ConcurrencyEngine {
  async atomicSave(repo: AccountRepository, updated: Account, expectedVersion: number): Promise<boolean> {
    const current = await repo.findById(updated.id)

    if (!current) throw new AccountNotFoundError(updated.id)

    const versionMatch = current.version === expectedVersion

    if (!versionMatch) return false

    updated.version++
    await repo.save(updated)

    return true
  }
}
