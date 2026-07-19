export function param(value: string | string[] | undefined, name = 'parameter'): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value[0]) return value[0]
  throw new Error(`Missing route ${name}`)
}
