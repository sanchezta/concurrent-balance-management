import { InMemoryAccountRepository } from "@/infrastructure/InMemoryAccountRepository"
import { ConcurrencyEngine } from "@/infrastructure/ConcurrencyEngine"
import { UpdateBalance } from "@/application/UpdateBalance"
import { Account } from "@/domain/Account"
import { test, expect } from "vitest"

test("Concurrencia en depósitos", async () => {
  const repo = new InMemoryAccountRepository()
  const engine = new ConcurrencyEngine()
  const useCase = new UpdateBalance(repo, engine)

  // Seed inicial de la cuenta para la simulación
  repo.seed(new Account("123", 0))

  const tasks = []

  // Simula 400 depósito concurrentes
  for (let i = 0; i < 400; i++) {
    tasks.push(
      new Promise(resolve => {
        setImmediate(() => {
          useCase.execute("123", 1, "deposit").then(resolve)
        });
      })
    );
  }

  // Espera a que todas las operaciones terminen
  await Promise.all(tasks)

  const finalAccount = await repo.findById("123")

  console.log("Cuenta final", finalAccount)
  expect(finalAccount?.balance).toBe(400)
});
