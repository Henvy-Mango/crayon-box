import config from './config'
import MultiStepInput from './multiStepInput'

interface NotificationState {
    symbol: string
    price: string
    percent: string
}

export async function addNotification() {
    async function selectSymbol(input: MultiStepInput, state: Partial<NotificationState>) {
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

    async function inputPrice(input: MultiStepInput, state: Partial<NotificationState>) {
        state.price = await input.showInputBox({
            title,
            step: 2,
            totalSteps: 3,
            value: state.price || '',
            placeholder: 'Input a price, such as 10000',
            prompt: 'You will be notified of the price upon arrival',
            validate: (value) => Promise.resolve(Number(value) ? undefined : 'Price must be a number'),
            shouldResume: () => Promise.resolve(false),
        })
        return (input: MultiStepInput) => inputPercent(input, state)
    }

    async function inputPercent(input: MultiStepInput, state: Partial<NotificationState>) {
        state.percent = await input.showInputBox({
            title,
            step: 3,
            totalSteps: 3,
            value: state.percent || '',
            placeholder: 'Input a percentage, such as 0.1',
            prompt: 'You will be notified of the percentage upon arrival',
            validate: (value) => Promise.resolve(Number(value) ? undefined : 'percentage must be a number'),
            shouldResume: () => Promise.resolve(false),
        })
    }

    async function collectInputs(step: (input: MultiStepInput, state: Partial<NotificationState>) => any) {
        const state = {} as Partial<NotificationState>
        await MultiStepInput.run((input) => step(input, state))
        return state as NotificationState
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
