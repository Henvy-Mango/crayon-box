// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import config from '~/utils/config'
import StatusBar from '~/ui/statusBar'
import StockProvider from '~/provider/StockProvider'
import BinnaceProvider from '~/provider/BinnaceProvider'

let timmer: NodeJS.Timeout

export function activate({ subscriptions }: vscode.ExtensionContext) {
    const binnaceProvider = new BinnaceProvider()
    const stockProvider = new StockProvider()
    const statusBar = new StatusBar(binnaceProvider, stockProvider)
    subscriptions.push(statusBar)

    timmer = setInterval(() => statusBar.refresh(), config.interval)

    subscriptions.push(
        ...[
            vscode.workspace.onDidChangeConfiguration((ex) => {
                const hasChanged = ex.affectsConfiguration('crayon-box')
                if (!hasChanged) {
                    return
                }
                vscode.window
                    .showInformationMessage('Configuration has been changed, click to reload.', { title: 'Reload' })
                    .then((item) => {
                        if (!item) return
                        vscode.commands.executeCommand('workbench.action.reloadWindow')
                    })
            }),

            vscode.commands.registerCommand('crayon-box.toggleStatusBar', async () => {
                statusBar.toggle()
            }),

            vscode.commands.registerCommand('crayon-box.addBinance', async () => {
                let symbol: string | undefined
                let debounce: NodeJS.Timeout | null = null

                const quickPick = vscode.window.createQuickPick()
                quickPick.placeholder = 'Search binance'
                quickPick.onDidChangeValue(async (value) => {
                    quickPick.busy = true
                    if (debounce) {
                        clearTimeout(debounce)
                        debounce = null
                    }
                    debounce = setTimeout(async () => {
                        quickPick.items = await binnaceProvider.suggest(value)
                        quickPick.busy = false
                    }, 100)
                })
                quickPick.onDidChangeSelection((e) => {
                    symbol = e[0].detail
                })
                quickPick.onDidAccept(() => {
                    if (!symbol) return
                    const newConfig = {
                        ...config.binance,
                        symbols: [...config.binance.symbols, symbol],
                    }
                    config.update('binance', newConfig, true)
                    quickPick.dispose()
                })
                quickPick.show()
            }),

            vscode.commands.registerCommand('crayon-box.addStock', async () => {
                let symbol: string | undefined
                let debounce: NodeJS.Timeout | null = null

                const quickPick = vscode.window.createQuickPick()
                quickPick.placeholder = 'Search stock'
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
                        ...config.stock,
                        symbols: [...config.stock.symbols, symbol],
                    }
                    config.update('stock', newConfig, true)
                    quickPick.dispose()
                })
                quickPick.show()
            }),
        ]
    )
}

export function deactivate() {
    clearInterval(timmer)
}
