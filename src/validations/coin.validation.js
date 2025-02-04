const { z } = require('zod')

const coinSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  image: z.string().url(),
  current_price: z.number().positive(),
  market_cap: z.number(),
  market_cap_rank: z.number().int(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number(),
  high_24h: z.number(),
  low_24h: z.number(),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number(),
  market_cap_change_24h: z.number(),
  market_cap_change_percentage_24h: z.number(),
  circulating_supply: z.number(),
  total_supply: z.number(),
  max_supply: z.number().nullable(),
  ath: z.number(),
  ath_change_percentage: z.number(),
  ath_date: z.string().datetime(),
  atl: z.number(),
  atl_change_percentage: z.number(),
  atl_date: z.string().datetime(),
  roi: z.any().nullable(),
  last_updated: z.string().datetime(),
})

module.exports = { coinSchema }
