// Import the required libraries
const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch HTML content of a web page
async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`Error fetching HTML from ${url}: ${error.message}`);
        return null;
    }
}

// Function to extract data from HTML using Cheerio
function extractData(html) {
    const $ = cheerio.load(html);
    const selectedElements = $('.products__product-card__image-link');
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
        // console.log(`Found ${links.length} links on ${url}:`);
        // links.forEach((link, index) => {
        //     console.log(`${index + 1}. ${link}`);
        // });
    }
}

// Example usage: Crawl a website
const targetUrl = 'https://www.lovecrafts.com/en-us/l/knitting/knitting-patterns/free-knitting-patterns';
webCrawler(targetUrl);
