import axios from 'axios'

export class Client {
    private apiUrl: string
    private client: axios.AxiosInstance

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
        this.client = axios.create({ baseURL: this.apiUrl })
        this.client.interceptors.response.use((response) => response.data)
    }

    getRequset<T>(url: string, config?: axios.AxiosRequestConfig) {
        return this.client.get<any, T>(url, config)
    }

    postRequset<T>(url: string, data?: any, config?: axios.AxiosRequestConfig) {
        return this.client.post<any, T>(url, data, config)
    }
}
