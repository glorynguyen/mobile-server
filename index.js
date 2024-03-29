const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const fsasync = require("fs").promises;
const path = require("path");

async function getCookieFromFile() {
  const filePath = path.join(__dirname, "cookies.txt");
  try {
    const cookieValue = await fsasync.readFile(filePath, "utf8");
    console.log("Get cookies success");
    return cookieValue.trim(); // Trim any whitespace from the cookie value
  } catch (error) {
    console.error("Error reading cookie file:", error);
    throw error; // Rethrow the error to handle it where the function is called
  }
}

async function main() {
  try {
    const cookie = await getCookieFromFile();
    const options = {
      headers: {
        Cookie: cookie,
      },
    };

    const targetUrl =
      "https://www.lovecrafts.com/en-gb/l/knitting/knitting-patterns/free-knitting-patterns";
    webCrawler(targetUrl, options);
  } catch (error) {
    // Handle errors, such as file not found or read permissions
    console.error("Failed to get cookie:", error);
  }
}

// Function to fetch HTML content of a web page
async function fetchHTML(url) {
  try {
    const response = await new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (error) => {
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
function extractPatternItem(html) {
  const $ = cheerio.load(html);
  const selectedElements = $("a.products__product-card__image-link"); // Adjust selector as needed
  return selectedElements;
}

async function downloadFileByUrlInNodeJs(url, options) {
  console.log("Downloading file from:", url);

  return new Promise((resolve, reject) => {
    const request = https.get(url, options, (response) => {
      // Check if the request was redirected
      const urlForDownloadPdf = response.headers.location || url;
      console.log("Location:", urlForDownloadPdf);

      https
        .get(urlForDownloadPdf, (response) => {
          // Check if the request was successful
          if (response.statusCode === 200) {
            // Extract the filename
            const filePath = path.join(__dirname, "downloaded.pdf");

            // Create a write stream to save the file
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);

            fileStream.on("finish", () => {
              fileStream.close();
              console.log("Download completed:", filePath);
            });

            fileStream.on("error", (error) => {
              console.error("Error writing to file:", error);
              fs.unlink(filePath, () => {}); // Delete the file if an error occurs
            });
          } else {
            console.error("Request Failed. Status Code:", response.statusCode);
          }
        })
        .on("error", (error) => {
          console.error("Error making the request:", error);
        });
    });

    request.on("error", (error) => {
      console.error("Error downloading file:", error);
      reject(error);
    });
  });
}

async function getPatternDetail(url, options) {
  const details = {};
  try {
    const html = await fetchHTML(url);
    if (html) {
      const $ = cheerio.load(html);
      const productSummary = $(".product-summary");
      if (productSummary && $(productSummary).attr("data-product-key")) {
        details.productKey = $(productSummary).attr("data-product-key");
        downloadFileByUrlInNodeJs(
          `https://www.lovecrafts.com/en-gb/account/library/download/${details.productKey}?userId=4072479`
        ,options);
      }
    }
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error);
  }
  return details;
}

// Main function to crawl a website then extract all product <a> tag
async function webCrawler(url, options) {
  const html = await fetchHTML(url);
  if (html) {
    // This is the list of a elements that we want to extract
    const links = extractPatternItem(html);
    const href = links[0].attribs.href;
    // Check if this link is existed in our system
    // Call api to check if we have crawled this link before
    console.log("Detected", href);
    getPatternDetail(href, options);
  }
}

main();