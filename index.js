const https = require('https');
const cheerio = require('cheerio');

// Function to fetch HTML content of a web page
async function fetchHTML(url) {
    try {
        const response = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
        return response;
    } catch (error) {
        console.error(`Error fetching HTML from ${url}:`, error);
        return null;
    }
}

// Function to extract data from HTML using Cheerio
function extractData(html) {
    const $ = cheerio.load(html);
    const selectedElements = $('.products__product-card'); // Adjust selector as needed
    return selectedElements;
    // Example: Extract all links from the page
    const links = [];
    $('a').each((index, element) => {
        links.push($(element).attr('href'));
    });
    return links;
}

// Main function to crawl a website
async function webCrawler(url) {
    const html = await fetchHTML(url);
    if (html) {
        const links = extractData(html);
        console.log("Detected", links.length);
        // Uncomment the following lines to print the links
        // links.forEach((link, index) => {
        //     console.log(`${index + 1}. ${link}`);
        // });
    }
}

// Example usage: Crawl a website
const targetUrl = 'https://www.lovecrafts.com/en-gb/l/knitting/knitting-patterns/free-knitting-patterns';
webCrawler(targetUrl);

