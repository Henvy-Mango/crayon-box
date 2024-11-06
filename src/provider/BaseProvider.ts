import type { ProviderItem } from '~/types'

export default abstract class BaseProvider {
    abstract order: number
    abstract get(): Promise<ProviderItem[]>
}
