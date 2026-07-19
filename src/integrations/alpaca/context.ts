import { AsyncLocalStorage } from 'node:async_hooks'

interface AlpacaRequestContext {
  accessToken?: string
}

export const alpacaRequestContext = new AsyncLocalStorage<AlpacaRequestContext>()

export function getAlpacaRequestToken(): string | undefined {
  return alpacaRequestContext.getStore()?.accessToken
}
