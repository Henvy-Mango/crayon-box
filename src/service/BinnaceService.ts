import config from '~/utils/config'
import { Client } from '~/utils/client'

type tickerInfoResult = {
    symbol: string
    priceChange: string
    priceChangePercent: string
    weightedAvgPrice: string
    openPrice: string
    highPrice: string
    lowPrice: string
    lastPrice: string
    volume: string
    quoteVolume: string
    openTime: number
    closeTime: number
    firstId: number
    lastId: number
    count: number
}[]

export default class BinanceService {
    private client = new Client(config.binance.apiUrl)

    private tickerInfo = '/api/v3/ticker'
    getTickerInfo = (symbols: string[], windowSize: '1m' | '15m' | '30m' | '1h' | '4h' | '1d') =>
        this.client.getRequset<tickerInfoResult>(this.tickerInfo, {
            symbols: JSON.stringify(symbols),
            windowSize: windowSize,
        })
}
