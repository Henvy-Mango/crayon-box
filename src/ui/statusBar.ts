import * as vscode from 'vscode'

import config from '~/utils/config'
import StockProvider from '~/provider/StockProvider'
import BinanceProvider from '~/provider/BinanceProvider'
import { isTradingDay, isTradingHours } from '~/utils/helper'

import type { ProviderItem } from '~/types'

export default class StatusBar {
    private visible = true
    private isTradingDay = true

    private binanceProvider: BinanceProvider
    private binanceStatusBarList: vscode.StatusBarItem[] = []

    private stockProvider: StockProvider
    private stockStatusBarList: vscode.StatusBarItem[] = []

    constructor(binanceProvider: BinanceProvider, stockProvider: StockProvider) {
        this.binanceProvider = binanceProvider
        this.stockProvider = stockProvider

        if (config.enabled) {
            this.init()
        }
    }

    init() {
        const that = this
        isTradingDay().then((o) => (that.isTradingDay = o))

        this.initBinanceStatusBar()
        this.initStockStatusBar()
    }

    dispose() {
        this.binanceStatusBarList.forEach((i) => i.dispose())
    }

    refresh() {
        if (!this.visible) return

        if (isTradingHours() && this.isTradingDay) {
            this.refreshStockStatusBar()
        }

        this.refreshBinanceStatusBar()
    }

    toggle() {
        const statusBarList = [...this.binanceStatusBarList, ...this.stockStatusBarList]
        this.visible = !this.visible
        if (this.visible) {
            statusBarList.forEach((i) => i.show())
        } else {
            statusBarList.forEach((i) => i.hide())
        }
    }

    initBinanceStatusBar() {
        this.binanceProvider.symbols.forEach(() => {
            const binanceStatusBar = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left,
                this.binanceProvider.order
            )
            this.binanceStatusBarList.push(binanceStatusBar)
        })
        this.refreshBinanceStatusBar()
    }

    async refreshBinanceStatusBar() {
        const providerData = await this.binanceProvider.get()

        providerData.forEach((providerItem, i) => {
            const item = this.binanceStatusBarList[i]
            item.command = 'crayon-box.addBinanceToStatusBar'
            item.text = this.getProviderText(providerItem)
            item.tooltip = this.getProviderTooltip(providerItem)
            item.show()
        })
    }

    initStockStatusBar() {
        this.stockProvider.symbols.forEach(() => {
            const stockStatusBar = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left,
                this.stockProvider.order
            )
            this.stockStatusBarList.push(stockStatusBar)
        })
        this.refreshStockStatusBar()
    }

    async refreshStockStatusBar() {
        const providerData = await this.stockProvider.get()

        providerData.forEach((providerItem, i) => {
            const item = this.stockStatusBarList[i]
            item.command = 'crayon-box.addStockToStatusBar'
            item.text = this.getProviderText(providerItem)
            item.tooltip = this.getProviderTooltip(providerItem)
            item.show()
        })
    }

    private getProviderText(providerItem: ProviderItem) {
        const { name, lastPrice, priceChangePercent } = providerItem
        const isIncrease = Number(priceChangePercent) > 0
        const icon = isIncrease ? '📈' : '📉'
        const sign = isIncrease ? '+' : ''

        return `「${name}」${lastPrice} ${icon} (${sign}${priceChangePercent}%)`
    }

    private getProviderTooltip(providerItem: ProviderItem) {
        const {
            provider,
            symbol,
            name,
            priceChange,
            priceChangePercent,
            openPrice,
            prevClosePrice,
            highPrice,
            lowPrice,
            closeTime,
            volume,
        } = providerItem

        const isIncrease = Number(priceChangePercent) > 0
        const sign = isIncrease ? '+' : ''
        return [
            `「${name}」\t${name === symbol ? '' : symbol} ${provider === 'binance' ? `${this.binanceProvider.windowSize} 滑动窗口` : ''}`,
            `涨跌：${sign}${priceChange}\t百分：${sign}${priceChangePercent}%`,
            `最高：${highPrice}\t最低：${lowPrice}`,
            `开价：${openPrice}\t昨收：${prevClosePrice ?? 'N/A'}`,
            `成交额：${volume}`,
            `更新时间：${closeTime}`,
        ].join('\n')
    }
}
