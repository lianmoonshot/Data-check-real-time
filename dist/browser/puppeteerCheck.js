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
exports.visitAndCheckPage = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
// Function to visit a URL and check cookies or other data
const visitAndCheckPage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    // Go to the provided URL
    yield page.goto(url);
    console.log(`Visited: ${url}`);
    // Check for cookies (or other relevant data)
    const cookies = yield page.cookies();
    console.log('Cookies:', cookies);
    // You can check specific cookies or page content here
    // Example: Check if the page has the expected variant path
    const pageContent = yield page.content();
    console.log('Page content length:', pageContent.length);
    // Close the browser
    yield browser.close();
});
exports.visitAndCheckPage = visitAndCheckPage;
// Example usage
(0, exports.visitAndCheckPage)('https://vpnpros.com/apple_ISR_D-616-A.html');
