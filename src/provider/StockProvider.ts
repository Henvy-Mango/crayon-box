import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'

import config from '~/utils/config'
import { formatNumber } from '~/utils/helper'
import BaseProvider from './BaseProvider'
import StockService from '~/service/StockService'

export default class StockProvider extends BaseProvider {
    private stockService = new StockService()

    symbols = config.stock.symbols ?? []
    order = config.stock.order ?? 0

    async get() {
        if (this.symbols.length === 0) {
            return []
        }

        let result
        try {
            result = await this.stockService.getStockInfo(this.symbols)
        } catch (error) {
            console.error(error)
            return []
        }

        return result
            .split(';\n')
            .filter((o) => o)
            .map((item) => {
                const code = item.split('="')[0].split('var hq_str_')[1]
                if (!/^(sh|sz|bj)/.test(code)) {
                    throw new Error('Unsupport code')
                }
                const params = item.split('="')[1].split(',')

                const priceChange = BigNumber(params[3]).minus(BigNumber(params[2]))
                const priceChangePercent = priceChange.div(BigNumber(params[2])).multipliedBy(100).toFixed(3)
                const lastPrice = formatNumber(params[3])
                const openPrice = formatNumber(params[1])
                const prevClosePrice = formatNumber(params[2])
                const highPrice = formatNumber(params[4])
                const lowPrice = formatNumber(params[5])
                const volume = BigNumber(params[9]).div(10000).toFixed(2)

                return {
                    provider: 'stock',
                    symbol: code,
                    name: params[0],
                    priceChange: priceChange.toString(),
                    priceChangePercent: priceChangePercent.toString(),
                    lastPrice: lastPrice,
                    openPrice: openPrice,
                    prevClosePrice: prevClosePrice,
                    highPrice: highPrice,
                    lowPrice: lowPrice,
                    closeTime: dayjs(`${params[30]} ${params[31]}`).format('YYYY-MM-DD HH:mm:ss'),
                    volume: volume.toString(),
                }
            })
    }

    async suggest(keyword?: string) {
        if (!keyword) {
            return []
        }

        let result
        try {
            result = await this.stockService.getSearchStock(keyword)
        } catch (error) {
            console.error(error)
            return []
        }

        return result.data.stock
            .filter((i: string[]) => ['sz', 'sh', 'bj'].includes(i[0]))
            .map((i: string[]) => {
                return {
                    label: i[2],
                    detail: i[0].toLowerCase() + i[1],
                    description: 'stock',
                }
            })
    }
}
