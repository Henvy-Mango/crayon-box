import config from '~/utils/config'
import { Client } from '~/utils/client'

export default class StockService {
    private client = new Client('https://hq.sinajs.cn')

    private stockInfo = '/list'
    getStockInfo = (symbols: string[]) =>
        this.client.getRequset<string>(`${this.stockInfo}=${symbols.join(',')}`, undefined, {
            responseType: 'arraybuffer',
            transformResponse: [
                (data) => {
                    const decoder = new TextDecoder('GB18030')
                    const body = decoder.decode(new Uint8Array(data))
                    return body
                },
            ],
            headers: {
                Referer: 'http://finance.sina.com.cn/',
            },
        })
}
