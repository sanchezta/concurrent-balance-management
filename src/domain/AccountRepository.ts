import { Account } from "@/domain/Account"


export interface AccountRepository {
  findById(id: string): Promise<Account | null>
  save(account: Account): Promise<void>
}
