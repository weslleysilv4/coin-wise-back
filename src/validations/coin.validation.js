const z = require('zod')

const coinSchema = z.object({
  symbol: z.string().min(1, { message: 'Symbol is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  image: z.string().url({ message: 'Image must be a valid URL' }),
  current_price: z
    .number()
    .positive({ message: 'Current price must be a positive number' }),
  market_cap: z.number({ message: 'Market cap must be a number' }),
  market_cap_rank: z
    .number()
    .int({ message: 'Market cap rank must be an integer' }),
  fully_diluted_valuation: z.number().nullable().or(z.literal(null), {
    message: 'Fully diluted valuation must be a number or null',
  }),
  total_volume: z.number({ message: 'Total volume must be a number' }),
  high_24h: z.number({ message: 'High 24h must be a number' }),
  low_24h: z.number({ message: 'Low 24h must be a number' }),
  price_change_24h: z
    .number({ message: 'Price change 24h must be a number' })
    .optional(),
  price_change_percentage_24h: z
    .number({
      message: 'Price change percentage 24h must be a number',
    })
    .optional(),
  market_cap_change_24h: z
    .number({
      message: 'Market cap change 24h must be a number',
    })
    .optional(),
  market_cap_change_percentage_24h: z
    .number({
      message: 'Market cap change percentage 24h must be a number',
    })
    .optional(),
  circulating_supply: z.number({
    message: 'Circulating supply must be a number',
  }),
  total_supply: z.number({ message: 'Total supply must be a number' }),
  max_supply: z
    .number()
    .nullable()
    .or(z.literal(null), { message: 'Max supply must be a number or null' }),
  ath: z.number({ message: 'All-time high (ATH) must be a number' }),
  ath_change_percentage: z
    .number({
      message: 'ATH change percentage must be a number',
    })
    .optional(),
  ath_date: z
    .string()
    .datetime({ message: 'ATH date must be a valid datetime string' })
    .optional(),
  atl: z.number({ message: 'All-time low (ATL) must be a number' }),
  atl_change_percentage: z
    .number({
      message: 'ATL change percentage must be a number',
    })
    .optional(),
  roi: z.any().nullable(),
})

module.exports = coinSchema
