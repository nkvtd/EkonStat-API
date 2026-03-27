import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export async function scrape(url: string, payload: URLSearchParams) {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    try {
        await client.get('https://e-nabavki.gov.mk/PublicAccess/home.aspx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const response = await client.post(url, payload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://e-nabavki.gov.mk/PublicAccess/home.aspx',
                'Origin': 'https://e-nabavki.gov.mk',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        return response.data;

    } catch (error: any) {
        throw error;
    }
}
