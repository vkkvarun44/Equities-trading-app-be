import { z } from 'zod'

export const accountIdParamSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
})

export const createAccountSchema = z.object({
  contact: z.object({
    email_address: z.string().email(),
    phone_number: z.string().min(1),
    street_address: z.array(z.string()).min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().optional(),
  }),
  identity: z.object({
    given_name: z.string().min(1),
    family_name: z.string().min(1),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    tax_id_type: z.string().min(1),
    tax_id: z.string().min(1),
    country_of_citizenship: z.string().optional(),
    country_of_tax_residence: z.string().optional(),
    funding_source: z.array(z.string()).min(1),
  }),
  disclosures: z.object({
    is_control_person: z.boolean(),
    is_affiliated_exchange_or_finra: z.boolean(),
    is_politically_exposed: z.boolean(),
    immediate_family_exposed: z.boolean(),
  }),
  agreements: z
    .array(
      z.object({
        agreement: z.string(),
        signed_at: z.string(),
        ip_address: z.string(),
      })
    )
    .min(1),
})

export const listAccountsQuerySchema = z.object({
  query: z.string().optional(),
  created_after: z.string().optional(),
  created_before: z.string().optional(),
})

export const createOrderSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  qty: z.string().optional(),
  notional: z.string().optional(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit', 'trailing_stop']),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']),
  limit_price: z.string().optional(),
  stop_price: z.string().optional(),
  trail_price: z.string().optional(),
  trail_percent: z.string().optional(),
  extended_hours: z.boolean().optional(),
  client_order_id: z.string().optional(),
  commission: z.string().optional(),
})

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
})

export const listOrdersQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  after: z.string().optional(),
  until: z.string().optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  symbols: z.string().optional(),
})

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(64),
  symbols: z.array(z.string().min(1).max(10)).optional().default([]),
})

export const watchlistIdParamSchema = z.object({
  watchlistId: z.string().uuid('Invalid watchlist ID'),
})

export const addAssetSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
})

export const symbolParamSchema = z.object({
  symbol: z.string().min(1).max(10),
})
