const calculatePriceChanges = (coin) => {
  const variation = (Math.random() * 10 - 5) / 100
  const oldPrice = coin.current_price / (1 + variation)
  const price_change_24h = coin.current_price - oldPrice
  const price_change_percentage_24h = (price_change_24h / oldPrice) * 100

  const oldMarketCap = oldPrice * coin.circulating_supply
  const currentMarketCap = coin.current_price * coin.circulating_supply
  const market_cap_change_24h = currentMarketCap - oldMarketCap
  const market_cap_change_percentage_24h =
    (market_cap_change_24h / oldMarketCap) * 100

  const ath_change_percentage =
    ((coin.current_price - coin.ath) / coin.ath) * 100
  const atl_change_percentage =
    ((coin.current_price - coin.atl) / coin.atl) * 100
  const ath_date =
    coin.current_price >= coin.ath ? new Date().toISOString() : coin.ath_date
  const atl_date =
    coin.current_price <= coin.atl ? new Date().toISOString() : coin.atl_date

  return {
    price_change_24h: Number(price_change_24h.toFixed(8)),
    price_change_percentage_24h: Number(price_change_percentage_24h.toFixed(2)),
    market_cap_change_24h: Number(market_cap_change_24h.toFixed(2)),
    market_cap_change_percentage_24h: Number(
      market_cap_change_percentage_24h.toFixed(2)
    ),
    ath_change_percentage: Number(ath_change_percentage.toFixed(2)),
    ath_date,
    atl_change_percentage: Number(atl_change_percentage.toFixed(2)),
    atl_date,
  }
}

module.exports = calculatePriceChanges
