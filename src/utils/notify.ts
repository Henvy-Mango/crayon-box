import dayjs from 'dayjs'
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

const remindPercentRecord: Record<string, boolean> = {}
const remindPriceRecord: Record<string, boolean> = {}

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
        (notifiedPrice.gt(0) && nowPrice.gte(notifiedPrice)) || (notifiedPrice.lt(0) && nowPrice.lte(notifiedPrice))

    const date = dayjs().format('HH:mm:ss')

    if (shouldNotifyPercent && !remindPercentRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price Change Percent is ${notifiedPercent.gt(0) ? 'increased' : 'decreased'} to ${nowPercent}% at ${date}`
        )
        remindPercentRecord[symbol] = true
        setTimeout(() => (remindPercentRecord[symbol] = false), 1000 * 60 * 5)
    }

    if (shouldNotifyPrice && !remindPriceRecord[symbol]) {
        vscode.window.showInformationMessage(
            `「${name}」Price is ${notifiedPrice.gt(0) ? 'increased' : 'decreased'} to ${nowPrice} at ${date}`
        )
        remindPriceRecord[symbol] = true
        setTimeout(() => (remindPriceRecord[symbol] = false), 1000 * 60 * 5)
    }
}
