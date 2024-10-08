import puppeteer from 'puppeteer';

// Function to visit a URL and check cookies or other data
export const visitAndCheckPage = async (url: string): Promise<void> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the provided URL
    await page.goto(url);
    console.log(`Visited: ${url}`);

    // Check for cookies (or other relevant data)
    const cookies = await page.cookies();
    console.log('Cookies:', cookies);

    // You can check specific cookies or page content here
    // Example: Check if the page has the expected variant path
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);

    // Close the browser
    await browser.close();
};

// Example usage
visitAndCheckPage('https://vpnpros.com/apple_ISR_D-616-A.html');
