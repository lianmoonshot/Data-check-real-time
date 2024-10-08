import * as puppeteer from 'puppeteer';
import { insertTestVariant } from '../setup/insertTestVariant';

let campaignUrl: string;
let basePagePath: string;

beforeAll(async () => {
    // Insert the test variant into DynamoDB and store the key value
    campaignUrl = await insertTestVariant();
    basePagePath = '/compare_1_category_ABW_T';

    //For testing dont delete
    // campaignUrl = 'https://vpnpros.com/apple_ISR_D.html';
    // basePagePath = '/apple_ISR_D';
});

const getPageTestCookie = async (page: puppeteer.Page) => {
    const cookies = await page.cookies();
    const pageTestCookie = cookies.find((c) => c.name === 'pageTest')?.value;
    return pageTestCookie ? JSON.parse(decodeURIComponent(pageTestCookie)) : null;
};

const validateStickyCookie = async (page: puppeteer.Page, basePagePath: string, variant: string) => {
    const cookies = await page.cookies();
    const stickyCookie = cookies.find((c) => c.name.startsWith('stickyABTestVariantPage'));
    expect(stickyCookie).toBeDefined();

    // Extract the cookie value and check if it's defined
    const cookieValue = stickyCookie?.value.replace(/^"|"$/g, '');

    // Ensure cookieValue is not undefined before testing with regex
    if (cookieValue) {
        // Construct a regex pattern to match the expected structure with a number
        const pattern = new RegExp(`^${basePagePath}-\\d+-${variant}\\.html$`);
        expect(pattern.test(cookieValue)).toBe(true);
    } else {
        throw new Error('Sticky cookie value is undefined');
    }
};



const testPage = async (page: puppeteer.Page, basePagePath: string, pageUrl: string) => {
    await page.goto(pageUrl);
    const cookie = await getPageTestCookie(page);
    expect(cookie?.isABTestEnabledForSlug).toBe(true);
    expect(['A', 'B']).toContain(cookie?.variantVersion);
    expect(cookie?.testId).not.toBeNull();

    if (cookie?.variantVersion) {
        await validateStickyCookie(page, basePagePath, cookie.variantVersion);
    }
};

test('Segment Detection on Landing', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await testPage(page, basePagePath, campaignUrl);
    await browser.close();
});

test('Navigating to Another Page (Non-Test Page)', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    //Remove from comment when testing
    // const nonTestPageUrl = 'https://vpnpros.com';
    const nonTestPageUrl = 'https://liandonttouch.creatorsite.net';
    await page.goto(nonTestPageUrl);
    const cookie = await getPageTestCookie(page);
    expect(cookie?.isABTestEnabledForSlug).toBe(false);
    await browser.close();
});

test('Refresh Page (Sticky Variant)', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(campaignUrl);
    const initialCookie = await getPageTestCookie(page);
    expect(initialCookie?.isABTestEnabledForSlug).toBe(true);
    expect(['A', 'B']).toContain(initialCookie?.variantVersion);
    const initialVariant = initialCookie?.variantVersion;
    const originalCookieValue = JSON.stringify(initialCookie);
    for (let i = 0; i < 3; i++) {
        await page.reload();
        const refreshedCookie = await getPageTestCookie(page);
        expect(refreshedCookie).not.toBeNull();
        expect(JSON.stringify(refreshedCookie)).toBe(originalCookieValue);
        expect(refreshedCookie?.variantVersion).toBe(initialVariant);
        expect(refreshedCookie?.isABTestEnabledForSlug).toBe(true);
        expect(refreshedCookie?.testId).not.toBeNull();
    }
    await browser.close();
});

test('Network Request Validation - VT page-view-data', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(campaignUrl);
    const requestPromise = new Promise<puppeteer.HTTPRequest>((resolve) => {
        page.on('request', (request) => {
            try {
                if (request.url().endsWith('/vt')) {
                    const postData = request.postData();
                    if (postData && postData.includes('page-view-data')) {
                        resolve(request);
                    }
                }
            } catch (error) {
                console.error('Error processing request:', error);
            }
        });
    });
    const request = await requestPromise;
    const postData = request.postData();
    if (!postData) {
        throw new Error('No post data found in the request');
    }
    const jsonPayload = JSON.parse(postData);
    const finalUrl = jsonPayload?.extra?.pageData?.finalUrl;
    const expectedUrl = `${campaignUrl}`;
    expect(finalUrl).toBe(expectedUrl);

    await browser.close();
});
