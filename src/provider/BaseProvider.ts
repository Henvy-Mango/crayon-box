import type { QuickPickItem } from 'vscode'
import type { ProviderItem } from '~/types'

export default abstract class BaseProvider {
    abstract order: number
    abstract get(): Promise<ProviderItem[]>
    abstract suggest(keyword?: string): Promise<QuickPickItem[]>
}
