export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`La cuenta con ID ${id} no fue encontrada.`)
  }
}
