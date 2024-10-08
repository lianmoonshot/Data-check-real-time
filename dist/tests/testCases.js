"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
// Helper function to get and parse the pageTest cookie
const getPageTestCookie = (page) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cookies = yield page.cookies(); // Using Puppeteer's Cookie type here
    const pageTestCookie = (_a = cookies.find((c) => c.name === 'pageTest')) === null || _a === void 0 ? void 0 : _a.value;
    return pageTestCookie ? JSON.parse(decodeURIComponent(pageTestCookie)) : null;
});
// 1. Segment Detection on Landing
test('Segment Detection on Landing', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user landing on a page from a campaign URL
    yield page.goto('https://vpnpros.com/campaign?utm_campaign=test');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.isABTestEnabledForSlug).toBe(true);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.testName).toBe('clarity test');
    yield browser.close();
}));
// 2. Navigating to Another Page (Non-Test Page)
test('Navigating to Another Page (Non-Test Page)', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user navigating to a non-test page
    yield page.goto('https://vpnpros.com/non-test-page');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.isABTestEnabledForSlug).toBe(false);
    yield browser.close();
}));
// 3. Navigating Back to a Test Page
test('Navigating Back to a Test Page', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user returning to a previously visited test page
    yield page.goto('https://vpnpros.com/test-page');
    yield page.goto('https://vpnpros.com/test-page');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.variantVersion).toBe('B'); // Assume variant B is sticky
    yield browser.close();
}));
// 4. URL Parameter Replacement
test('URL Parameter Replacement', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // User navigates to a page with URL parameters
    yield page.goto('https://vpnpros.com/static-page?param=value');
    // Simulate replacing the URL parameter using history.replaceState
    yield page.evaluate(() => {
        window.history.replaceState(null, '', '/static-page');
    });
    const newURL = yield page.url();
    expect(newURL).toBe('https://vpnpros.com/static-page');
    yield browser.close();
}));
// 5. PPC User Conversion
test('PPC User Conversion', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user landing on a PPC campaign page and converting to another page
    yield page.goto('https://vpnpros.com/ppc-campaign?utm_source=google');
    yield page.goto('https://vpnpros.com/conversion-page');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.testName).toBe('clarity test');
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.isABTestEnabledForSlug).toBe(true);
    yield browser.close();
}));
// 6. Navigate from the Creator Settings Menu
test('Navigate from Creator Settings Menu', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user navigating to the landing page from creator settings menu
    yield page.goto('https://vpnpros.com/creator-settings');
    // Check the landing page content
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.isABTestEnabledForSlug).toBe(false); // Assuming no A/B test here
    yield browser.close();
}));
// 7. A/B Test Navigation
test('A/B Test Navigation', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user navigating to an A/B test page
    yield page.goto('https://vpnpros.com/ab-test-page');
    const cookie = yield getPageTestCookie(page);
    expect(['A', 'B']).toContain(cookie === null || cookie === void 0 ? void 0 : cookie.variantVersion); // Check for random variant
    yield browser.close();
}));
// 8. Test URL Parameter Replacement on Test Pages
test('Test URL Parameter Replacement on Test Pages', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user navigating between test pages with URL parameters
    yield page.goto('https://vpnpros.com/test-page?var=a');
    // Simulate replacing URL parameter
    yield page.evaluate(() => {
        window.history.replaceState(null, '', '/test-page');
    });
    const newURL = yield page.url();
    expect(newURL).toBe('https://vpnpros.com/test-page');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.variantVersion).toBe('A');
    yield browser.close();
}));
// 9. Navigation Between Static and Test Pages
test('Navigation Between Static and Test Pages', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Simulate user entering a static page, then a test page
    yield page.goto('https://vpnpros.com/static-page');
    yield page.goto('https://vpnpros.com/test-page');
    const cookie = yield getPageTestCookie(page);
    expect(cookie === null || cookie === void 0 ? void 0 : cookie.isABTestEnabledForSlug).toBe(true);
    expect(['A', 'B']).toContain(cookie === null || cookie === void 0 ? void 0 : cookie.variantVersion);
    yield browser.close();
}));
// 10. Refresh Page (Sticky Variant)
test('Refresh Page (Sticky Variant)', () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    yield page.goto('https://vpnpros.com/test-page');
    // Refresh the page multiple times to ensure the variant is sticky
    for (let i = 0; i < 3; i++) {
        yield page.reload();
        const cookie = yield getPageTestCookie(page);
        expect(cookie === null || cookie === void 0 ? void 0 : cookie.variantVersion).toBe('B'); // Assuming variant B is sticky
    }
    yield browser.close();
}));
