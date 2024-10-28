import * as puppeteer from 'puppeteer';
import stripAnsi from 'strip-ansi'; // Import strip-ansi to clean error messages
import { insertTestVariant } from '../setup/insertTestVariant';
import { sendSlackMessage } from '../slack/slackNotifier';

let campaignUrl: string;
let basePagePath: string;
let browser: puppeteer.Browser | null = null;
let page: puppeteer.Page | null = null;

beforeAll(async () => {
    // Insert the test variant into DynamoDB and store the key value
    campaignUrl = await insertTestVariant();
    basePagePath = '/compare_1_category_ABW_T';
    // For testing don't delete
    // campaignUrl = 'https://vpnpros.com/apple_ISR_D.html';
    // basePagePath = '/apple_ISR_D';
});

afterEach(async () => {
    if (page) {
        await page.close();
        page = null;
    }
    if (browser) {
        await browser.close();
        browser = null;
    }
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
    const cookieValue = stickyCookie?.value.replace(/^"|"$/g, '');

    if (cookieValue) {
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

const sendSlackTestResult = async (testName: string, error?: Error) => {
    if (error) {
        const cleanMessage = stripAnsi(error.message);
        const message = `❌ Test "${testName}" failed.\nError: ${cleanMessage}`;
        await sendSlackMessage(message);
    }
};

// Test 1: Segment Detection on Landing Page
test('Segment Detection on Landing', async () => {
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await testPage(page, basePagePath, campaignUrl);
    } catch (error: any) {
        console.error('Test "Segment Detection on Landing" failed:', error);
        await sendSlackTestResult('Segment Detection on Landing', error);
        throw error;
    }
});

// Test 2: Navigating to a Non-Test Page
test('Navigating to Another Page (Non-Test Page)', async () => {
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        // const nonTestPageUrl = 'https://vpnpros.com';  // URL of a page that is not part of the test
        const nonTestPageUrl = 'https://liandonttouch.creatorsite.net';
        await page.goto(nonTestPageUrl);
        const cookie = await getPageTestCookie(page);
        expect(cookie?.isABTestEnabledForSlug).toBe(false);  // Validate that no test is enabled
    } catch (error: any) {
        console.error('Test "Navigating to Another Page (Non-Test Page)" failed:', error);
        await sendSlackTestResult('Navigating to Another Page (Non-Test Page)', error);
        throw error;
    }
});

// Test 3: Refresh Page and Validate Sticky Variant
test('Refresh Page (Sticky Variant)', async () => {
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto(campaignUrl);
        const initialCookie = await getPageTestCookie(page);
        expect(initialCookie?.isABTestEnabledForSlug).toBe(true);
        expect(['A', 'B']).toContain(initialCookie?.variantVersion);
        const initialVariant = initialCookie?.variantVersion;
        const originalCookieValue = JSON.stringify(initialCookie);

        // Refresh the page multiple times and ensure the variant remains sticky
        for (let i = 0; i < 3; i++) {
            await page.reload();
            const refreshedCookie = await getPageTestCookie(page);
            expect(refreshedCookie).not.toBeNull();
            expect(JSON.stringify(refreshedCookie)).toBe(originalCookieValue);  // The cookie should not change
            expect(refreshedCookie?.variantVersion).toBe(initialVariant);  // The variant should remain consistent
            expect(refreshedCookie?.isABTestEnabledForSlug).toBe(true);
            expect(refreshedCookie?.testId).not.toBeNull();
        }
    } catch (error: any) {
        console.error('Test "Refresh Page (Sticky Variant)" failed:', error);
        await sendSlackTestResult('Refresh Page (Sticky Variant)', error);
        throw error;
    }
});

// Test 4: Validate Network Request for GraphQL page-view-data
test('Network Request Validation - VT page-view-data', async () => {
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto(campaignUrl);

        const requestPromise = new Promise<puppeteer.HTTPRequest>((resolve) => {
            // Listen for network requests and filter for the page-view-data GraphQL request
            page!.on('request', (request) => {
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

        // Validate that the final URL in the response matches the expected URL
        const request = await requestPromise;
        const postData = request.postData();
        if (!postData) {
            throw new Error('No post data found in the request');
        }
        const jsonPayload = JSON.parse(postData);
        const finalUrl = jsonPayload?.extra?.pageData?.finalUrl;
        const expectedUrl = `${campaignUrl}`;
        expect(finalUrl).toBe(expectedUrl);
    } catch (error: any) {
        console.error('Test "Network Request Validation - VT page-view-data" failed:', error);
        await sendSlackTestResult('Network Request Validation - VT page-view-data', error);
        throw error;
    }
});
