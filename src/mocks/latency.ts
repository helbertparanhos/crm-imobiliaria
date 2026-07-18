/** Helpers da camada mock (Fase 1). */

/** Simula latência de rede para exercitar estados de loading/erro. */
export function mockDelay<T>(data: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(data)), ms))
}

/** Cópia profunda — evita que consumidores mutem o "banco" em memória por referência. */
export function clone<T>(value: T): T {
  return structuredClone(value)
}

/** Gera id único para novas entidades (mock). */
export function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
