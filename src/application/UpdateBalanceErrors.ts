export class MaxRetriesExceededError extends Error {
  constructor(maxRetries: number) {
    super(`Se ha superado el número máximo de reintentos permitidos (${maxRetries}).`)
  }
}
