import * as vscode from 'vscode'
import BigNumber from 'bignumber.js'

import config from './config'
import MultiStepInput from './multiStepInput'

import type { PluginConfig, ProviderItem } from '~/types'

export async function addRemind() {
    async function selectSymbol(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        const pick = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: 3,
            placeholder: 'Select a symbol',
            items: config.binance.symbols.map((o) => {
                return { label: o, description: o }
            }),
            shouldResume: () => Promise.resolve(false),
        })
        if (pick) {
            state.symbol = pick.label
        }
        return (input: MultiStepInput) => inputPrice(input, state)
    }

    async function inputPrice(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        state.price = await input.showInputBox({
            title,
            step: 2,
            totalSteps: 3,
            value: state.price?.toString() || '',
            placeholder: 'Input a price, such as 10000',
            prompt: 'You will be notified of the price upon arrival',
            validate: (value) => Promise.resolve(Number(value) ? undefined : 'Price must be a number'),
            shouldResume: () => Promise.resolve(false),
        })
        return (input: MultiStepInput) => inputPercent(input, state)
    }

    async function inputPercent(input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) {
        state.percent = await input.showInputBox({
            title,
            step: 3,
            totalSteps: 3,
            value: state.percent?.toString() || '',
            placeholder: 'Input a percentage, such as 0.1',
            prompt: 'You will be notified of the percentage upon arrival',
            validate: (value) => Promise.resolve(Number(value) ? undefined : 'percentage must be a number'),
            shouldResume: () => Promise.resolve(false),
        })
    }

    async function collectInputs(step: (input: MultiStepInput, state: Partial<PluginConfig['remind'][0]>) => any) {
        const state = {} as Partial<PluginConfig['remind'][0]>
        await MultiStepInput.run((input) => step(input, state))
        return state as PluginConfig['remind']
    }

    const title = 'Add Notification'
    let state

    try {
        state = await collectInputs(selectSymbol)
    } catch (error) {
        console.log(error)
    }

    console.log(state)
    return state
}

const remindPrecentRecord: Record<string, boolean> = {}
const remindPriceRecord: Record<string, boolean> = {}

export async function notified({ symbol, name, lastPrice, priceChangePercent }: ProviderItem) {
    const state = config.remind.find((o) => o.symbol === symbol)

    if (!state) {
        return
    }

    const nowPrice = BigNumber(lastPrice)
    const nowPrecent = BigNumber(priceChangePercent) ?? BigNumber(0)

    const notifiedPrice = BigNumber(state.price)
    const notifiedPrecent = BigNumber(state.percent)

    const isIncrease = nowPrecent.gt(0)

    const shouldNotifyPercent =
        (notifiedPrecent.gt(0) && nowPrecent.gt(notifiedPrecent)) ||
        (notifiedPrecent.lt(0) && nowPrecent.lt(notifiedPrecent))

    const shouldNotifyPrice =
        (nowPrecent.gt(0) && nowPrice.gt(notifiedPrice)) || (nowPrecent.lt(0) && nowPrice.lt(notifiedPrice))

    if (shouldNotifyPercent && !remindPrecentRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price Change Percent is ${isIncrease ? 'increased' : 'decreased'} to ${nowPrecent}%`
        )
        remindPrecentRecord[symbol] = true
        setTimeout(() => (remindPrecentRecord[symbol] = false), 1000 * 60 * 5)
    }

    if (shouldNotifyPrice && !remindPriceRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price is ${isIncrease ? 'increased' : 'decreased'} to ${nowPrice}`
        )
        remindPriceRecord[symbol] = true
        setTimeout(() => (remindPriceRecord[symbol] = false), 1000 * 60 * 5)
    }
}
