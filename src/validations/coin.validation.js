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
  total_volume: z.number({ message: 'Total volume must be a number' }),
  high_24h: z.number({ message: 'High 24h must be a number' }),
  low_24h: z.number({ message: 'Low 24h must be a number' }),
  circulating_supply: z.number({
    message: 'Circulating supply must be a number',
  }),
  total_supply: z.number({ message: 'Total supply must be a number' }),
  max_supply: z
    .number()
    .nullable()
    .or(z.literal(null), { message: 'Max supply must be a number or null' }),
  ath: z.number({ message: 'All-time high (ATH) must be a number' }),
  atl: z.number({ message: 'All-time low (ATL) must be a number' }),
})

module.exports = coinSchema
