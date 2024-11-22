import dayjs from 'dayjs'
import * as vscode from 'vscode'
import BigNumber from 'bignumber.js'

import config from './config'
import MultiStepInput from './multiStepInput'

import type { PluginConfig, ProviderItem } from '~/types'

export async function addRemind() {
    async function selectSymbol(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        const symbols = [...config.binance.symbols, ...config.stock.symbols]
        const pick = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: 3,
            placeholder: 'Select a symbol',
            items: symbols.map((o) => {
                return { label: o, description: o }
            }),
            shouldResume: () => new Promise<boolean>(() => {}),
        })
        if (pick) {
            state.symbol = pick.label
        }
        return (input: MultiStepInput) => inputPrice(input, state)
    }

    async function inputPrice(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        state.price = Number(
            await input.showInputBox({
                title,
                step: 2,
                totalSteps: 3,
                value: state.price?.toString() || '0',
                placeholder: 'Input a price, such as 1000 or -1000. Zero means you will not be notified.',
                prompt: 'You will be notified when it increases or decreases to the specified price.',
                validate: (value) => Promise.resolve(isNaN(Number(value)) ? 'Price must be a number' : undefined),
                shouldResume: () => new Promise<boolean>(() => {}),
            })
        )
        return (input: MultiStepInput) => inputPercent(input, state)
    }

    async function inputPercent(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        state.percent = Number(
            await input.showInputBox({
                title,
                step: 3,
                totalSteps: 3,
                value: state.percent?.toString() || '0',
                placeholder: 'Input a percentage, such as 0.1 or -0.1. Zero means you will not be notified.',
                prompt: 'You will be notified when it increases or decreases to the specified percentage.',
                validate: (value) => Promise.resolve(isNaN(Number(value)) ? 'percentage must be a number' : undefined),
                shouldResume: () => new Promise<boolean>(() => {}),
            })
        )
    }

    async function collectInputs(step: (input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) => any) {
        const state = {} as Partial<PluginConfig['remind'][0]>
        await MultiStepInput.run((input) => step(input, state))
        return state as PluginConfig['remind'][0]
    }

    const title = 'CrayonBox: Add Remind to Symbol'
    let state: PluginConfig['remind'][0] | undefined
    try {
        state = await collectInputs(selectSymbol)
    } catch (error) {
        console.log(error)
    }
    if (!state) return
    config.update('remind', [...config.remind, state], true)
}

const percentRecord: Record<string, boolean> = {}
const priceRecord: Record<string, boolean> = {}

export async function notified({ symbol, name, lastPrice, priceChangePercent }: ProviderItem) {
    const state = config.remind.find((o) => o.symbol === symbol)

    if (!state) {
        return
    }

    const nowPrice = BigNumber(lastPrice)
    const nowPercent = BigNumber(priceChangePercent)

    const notifiedPrice = BigNumber(state.price) ?? BigNumber(0)
    const notifiedPercent = BigNumber(state.percent) ?? BigNumber(0)

    const shouldNotifyPercent =
        (notifiedPercent.gt(0) && nowPercent.gte(notifiedPercent)) ||
        (notifiedPercent.lt(0) && nowPercent.lte(notifiedPercent))

    const shouldNotifyPrice =
        (notifiedPrice.gt(0) && nowPrice.gte(notifiedPrice)) ||
        (notifiedPrice.lt(0) && nowPrice.lte(notifiedPrice.abs()))

    const date = dayjs().format('HH:mm:ss')

    if (shouldNotifyPercent && !percentRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price Change Percent is ${notifiedPercent.gt(0) ? 'increased' : 'decreased'} to ${nowPercent}% at ${date}`
        )
        percentRecord[symbol] = true
        setTimeout(() => (percentRecord[symbol] = false), 1000 * 60 * 5)
    }

    if (shouldNotifyPrice && !priceRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price is ${notifiedPrice.gt(0) ? 'increased' : 'decreased'} to ${nowPrice} at ${date}`
        )
        priceRecord[symbol] = true
        setTimeout(() => (priceRecord[symbol] = false), 1000 * 60 * 5)
    }
}
