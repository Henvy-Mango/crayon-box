import config from '~/utils/config'
import { Client } from '~/utils/client'

import type { PluginConfig } from '~/types'

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
    getTickerInfo = (symbols: string[], windowSize: PluginConfig['binance']['windowSize']) =>
        this.client.getRequset<tickerInfoResult>(this.tickerInfo, {
            params: {
                symbols: JSON.stringify(symbols),
                windowSize: windowSize,
            },
        })

    private lastPrice = '/api/v3/ticker/price'
    getLastPrice = (symbols?: string[]) =>
        this.client.getRequset<{ symbol: string; price: string }[]>(this.lastPrice, { params: { symbols } })
}
