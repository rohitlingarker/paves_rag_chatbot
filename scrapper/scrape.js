import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";

// 🔧 List of all page URLs you want to scrape
const urls = [
  "https://pavestechnologies.com/",
  "https://pavestechnologies.com/contact",
  "https://pavestechnologies.com/thought-leadership",
  "https://pavestechnologies.com/services",
  "https://pavestechnologies.com/paves-ai-labs",
  "https://pavestechnologies.com/industry-verticals",
  "https://pavestechnologies.com/technology-council/",
  "https://pavestechnologies.com/management-advisory-board",
  "https://pavestechnologies.com/about",
  // Add more pages as needed
];

async function scrapePage(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const sections = [];

    $("h1, h2, h3, p").each((index, element) => {
      const tag = $(element).get(0).tagName;
      const text = $(element).text().trim();

      if (text.length > 30) {
        sections.push({
          id: `${url}#${tag}-${index}`,
          tag,
          text,
          url
        });
      }
    });

    return sections;
  } catch (err) {
    console.error(`❌ Error scraping ${url}:`, err.message);
    return [];
  }
}

async function scrapeAllPages() {
  const allSections = [];

  for (const url of urls) {
    console.log(`🔍 Scraping: ${url}`);
    const sections = await scrapePage(url);
    allSections.push(...sections);
  }

  await fs.writeFile("websiteData.json", JSON.stringify(allSections, null, 2), "utf-8");
  console.log(`✅ Scraped ${allSections.length} sections from ${urls.length} pages.`);
}

scrapeAllPages();
