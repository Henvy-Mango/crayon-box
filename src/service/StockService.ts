import { Client } from '~/utils/client'

export default class StockService {
    private infoClient = new Client('https://hq.sinajs.cn')
    private stockInfo = '/list'
    getStockInfo = (symbols: string[]) =>
        this.infoClient.getRequset<string>(`${this.stockInfo}=${symbols.join(',')}`, undefined, {
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

    private searchClient = new Client('http://suggest3.sinajs.cn')
    private searchStock = '/suggest/type=2&key='
    getSearchStock = (keyword: string) =>
        this.searchClient.getRequset<any>(this.searchStock + encodeURIComponent(keyword), null, {
            responseType: 'arraybuffer',
            transformResponse: [
                (data) => {
                    const decoder = new TextDecoder('GB18030')
                    const body = decoder.decode(new Uint8Array(data))
                    return body
                },
            ],
        })
}
