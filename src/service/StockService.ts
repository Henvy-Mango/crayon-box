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

    private searchClient = new Client('https://proxy.finance.qq.com')
    private searchStock = '/ifzqgtimg/appstock/smartbox/search/get'
    getSearchStock = (keyword: string) => this.searchClient.getRequset<any>(this.searchStock, { q: keyword })
}
