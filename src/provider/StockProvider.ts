import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'

import config from '~/utils/config'
import BaseProvider from './BaseProvider'
import { notified } from '~/utils/remind'
import { formatNumber } from '~/utils/helper'
import StockService from '~/service/StockService'

export default class StockProvider extends BaseProvider {
    private stockService = new StockService()

    symbols = config.stock.symbols || []
    order = config.stock.order || 0

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
                if (!/^(sh|sz)/.test(code)) {
                    throw new Error('Unsupport code')
                }
                const params = item.split('="')[1].split(',')

                const priceChange = BigNumber(params[3]).minus(BigNumber(params[2]))
                const priceChangePercent = priceChange.div(BigNumber(params[2])).multipliedBy(100).toFixed(3)
                const openPrice = formatNumber(params[1])
                const prevClosePrice = formatNumber(params[2])
                const lastPrice = BigNumber(params[3]).gt(0) ? formatNumber(params[3]) : prevClosePrice
                const highPrice = formatNumber(params[4])
                const lowPrice = formatNumber(params[5])
                const volume = BigNumber(params[9]).div(10000).toFixed(2)

                const data = {
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

                notified(data)

                return data
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

        return result
            .replace('var suggestvalue="', '')
            .replace('";', '')
            .split(';')
            .map((item: string) => {
                let row = item.split(',')
                let code: string = row[0]
                let label: string = row[4]
                let exchange: string = row[7]

                switch (code.substring(0, 2)) {
                    case 'sh':
                    case 'sz':
                        break
                    default:
                        return null
                }

                return {
                    label: label,
                    detail: code,
                    description: exchange,
                }
            })
            .filter((o: any) => o)
    }
}
