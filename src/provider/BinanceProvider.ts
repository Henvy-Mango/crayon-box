import dayjs from 'dayjs'

import config from '~/utils/config'
import BaseProvider from './BaseProvider'
import { notified } from '~/utils/notify'
import { formatNumber } from '~/utils/helper'
import BinanceService from '~/service/BinanceService'

export default class BinanceProvider extends BaseProvider {
    private binanceService = new BinanceService()

    symbols = config.binance.symbols || []
    order = config.binance.order || 0

    windowSize = config.binance.windowSize || '1d'

    async get() {
        if (this.symbols.length === 0) {
            return []
        }

        let result
        try {
            result = await this.binanceService.getTickerInfo(this.symbols, this.windowSize)
        } catch (error) {
            console.error(error)
            return []
        }

        return result.map((o) => {
            const data = {
                provider: 'binance',
                symbol: o.symbol,
                name: o.symbol,
                lastPrice: formatNumber(o.lastPrice),
                weightedAvgPrice: formatNumber(o.weightedAvgPrice),
                priceChange: formatNumber(o.priceChange),
                priceChangePercent: formatNumber(o.priceChangePercent),
                openPrice: formatNumber(o.openPrice),
                highPrice: formatNumber(o.highPrice),
                lowPrice: formatNumber(o.lowPrice),
                openTime: dayjs(o.openTime).format('YYYY-MM-DD HH:mm:ss'),
                closeTime: dayjs(o.closeTime).format('YYYY-MM-DD HH:mm:ss'),
                volume: formatNumber(o.volume),
            }

            notified(data)

            return data
        })
    }

    async suggest(keyword?: string) {
        let result
        try {
            result = await this.binanceService.getLastPrice()
        } catch (error) {
            console.error(error)
            return []
        }

        return result.map((o) => {
            return {
                label: o.symbol,
                detail: o.symbol,
                description: 'binance',
            }
        })
    }
}
