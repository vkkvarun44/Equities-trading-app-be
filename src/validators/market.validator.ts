import { z } from 'zod'

export const listAssetsQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  asset_class: z.string().optional(),
})

export const searchSymbolQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  asset_class: z.string().optional().default('us_equity'),
})

export const symbolParamSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
})

export const historicalBarsQuerySchema = z.object({
  timeframe: z.string().min(1).default('1Day'),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.coerce.number().int().positive().max(10_000).optional(),
  adjustment: z.enum(['raw', 'split', 'dividend', 'all']).optional(),
  feed: z.enum(['iex', 'sip']).optional(),
})
