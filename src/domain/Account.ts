export class Account {
  constructor(
    public readonly id: string,
    private _balance: number,
    public version: number = 0
  ) { }

  get balance(): number {
    return this._balance
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("El monto del depósito debe ser positivo.")
    }

    this._balance += amount
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error("El monto a retiral debe ser mayor a cero.")
    }

    if (this._balance - amount < 0) {
      throw new Error("Fondos insufucientes.")
    }

    this._balance -= amount
  }
}
