import axios, { type AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export class ScrapingClient {
    private client: AxiosInstance;
    private isInitialised: boolean = false;
    private referer: string;
    private origin: string;

    constructor(referer: string, origin: string) {
        this.referer = referer;
        this.origin = origin;

        const jar = new CookieJar();
        this.client = wrapper(axios.create({ jar }));
    }

    async init() {
        if (this.isInitialised) return;

        await this.client.get(this.referer, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        this.isInitialised = true;
    }

    async scrape(
        method: 'POST' | 'GET',
        url: string,
        payload: URLSearchParams,
    ) {
        if (method === 'POST') return this.scrapePost(url, payload);

        return this.scrapeGet(url, payload);
    }

    async scrapePost(url: string, payload: URLSearchParams) {
        const response = await this.client.post(url, payload.toString(), {
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: this.referer,
                Origin: this.origin,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        return response.data;
    }

    async scrapeGet(url: string, payload: URLSearchParams) {
        const response = await this.client.get(url, {
            params: payload,
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: this.referer,
                Origin: this.origin,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        return response.data;
    }
}
