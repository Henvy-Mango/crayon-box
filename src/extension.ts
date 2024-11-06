// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import config from '~/utils/config'
import StatusBar from '~/ui/statusBar'
import BinnaceProvider from '~/provider/BinnaceProvider'
import StockProvider from '~/provider/StockProvider'

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

            vscode.commands.registerCommand('crayon-box.toggle', async () => {
                statusBar.toggle()
            }),
        ]
    )
}

export function deactivate() {
    clearInterval(timmer)
}
