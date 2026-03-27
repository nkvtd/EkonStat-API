import axios, { type AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export class ScrapingClient {
    private client: AxiosInstance;
    private isInitialised: boolean = false;

    constructor() {
        const jar = new CookieJar();
        this.client = wrapper(axios.create({ jar }));
    }

    async init() {
        if (this.isInitialised) return;

        await this.client.get(
            'https://e-nabavki.gov.mk/PublicAccess/home.aspx',
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            },
        );

        this.isInitialised = true;
    }

    async scrape(url: string, payload: URLSearchParams) {
        const response = await this.client.post(url, payload.toString(), {
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: 'https://e-nabavki.gov.mk/PublicAccess/home.aspx',
                Origin: 'https://e-nabavki.gov.mk',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        return response.data;
    }
}
