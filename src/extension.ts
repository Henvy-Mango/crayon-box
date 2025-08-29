// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import config from '~/utils/config'
import StatusBar from '~/ui/statusBar'
import { addRemind } from '~/utils/remind'
import globalState from '~/utils/globalState'
import StockProvider from '~/provider/StockProvider'
import BinanceProvider from '~/provider/BinanceProvider'

let timmer: NodeJS.Timeout

export function activate({ subscriptions }: vscode.ExtensionContext) {
    const binanceProvider = new BinanceProvider()
    const stockProvider = new StockProvider()
    const statusBar = new StatusBar(binanceProvider, stockProvider)
    subscriptions.push(statusBar)

    timmer = setInterval(() => statusBar.refresh(), config.interval)

    subscriptions.push(
        ...[
            vscode.commands.registerCommand('crayon-box.toggleStatusBar', async () => {
                statusBar.toggle()
            }),

            vscode.commands.registerCommand('crayon-box.addBinanceToStatusBar', async () => {
                let symbol: string | undefined
                let debounce: NodeJS.Timeout | null = null

                const quickPick = vscode.window.createQuickPick()
                quickPick.placeholder = vscode.l10n.t('Search symbol in binance and add it to status bar')
                quickPick.onDidChangeValue(async (value) => {
                    quickPick.busy = true
                    if (debounce) {
                        clearTimeout(debounce)
                        debounce = null
                    }
                    debounce = setTimeout(async () => {
                        quickPick.items = await binanceProvider.suggest(value)
                        quickPick.busy = false
                    }, 100)
                })
                quickPick.onDidChangeSelection((e) => {
                    symbol = e[0].detail
                })
                quickPick.onDidAccept(() => {
                    if (!symbol) return
                    const newConfig = {
                        ...globalState.binance,
                        symbols: [...globalState.binance.symbols, symbol],
                    }
                    globalState.binance = newConfig
                    config.update('binance', newConfig, true)
                    quickPick.dispose()

                    binanceProvider.symbols = newConfig.symbols
                    statusBar.dispose()
                    setTimeout(() => statusBar.init(), 300)
                })
                quickPick.show()
            }),

            vscode.commands.registerCommand('crayon-box.addStockToStatusBar', async () => {
                let symbol: string | undefined
                let debounce: NodeJS.Timeout | null = null

                const quickPick = vscode.window.createQuickPick()
                quickPick.placeholder = vscode.l10n.t('Search symbol in stock and add it to status bar')
                quickPick.onDidChangeValue(async (value) => {
                    quickPick.busy = true
                    if (debounce) {
                        clearTimeout(debounce)
                        debounce = null
                    }
                    debounce = setTimeout(async () => {
                        quickPick.items = await stockProvider.suggest(value)
                        quickPick.busy = false
                    }, 100)
                })
                quickPick.onDidChangeSelection((e) => {
                    symbol = e[0].detail
                })
                quickPick.onDidAccept(() => {
                    if (!symbol) return
                    const newConfig = {
                        ...globalState.stock,
                        symbols: [...globalState.stock.symbols, symbol],
                    }
                    globalState.stock = newConfig
                    config.update('stock', newConfig, true)
                    quickPick.dispose()

                    stockProvider.symbols = newConfig.symbols
                    statusBar.dispose()
                    setTimeout(() => statusBar.init(), 300)
                })
                quickPick.show()
            }),

            vscode.commands.registerCommand('crayon-box.addRemind', async () => addRemind()),
        ]
    )
}

export function deactivate() {
    clearInterval(timmer)
}
