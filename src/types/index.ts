export type ProviderItem = {
    provider: string
    symbol: string
    name: string
    lastPrice: string
    priceChange: string
    priceChangePercent: string
    openPrice: string
    prevClosePrice?: string
    highPrice: string
    lowPrice: string
    closeTime: string
    volume: string
    openTime?: string
    weightedAvgPrice?: string
}

export type PluginConfig = {
    enabled: boolean
    interval: number
    binance: {
        symbols: string[]
        order: number
        apiUrl: string
        windowSize: '1m' | '15m' | '30m' | '1h' | '4h' | '6h' | '12h' | '1d'
    }
    stock: {
        symbols: string[]
        order: number
    }
}
