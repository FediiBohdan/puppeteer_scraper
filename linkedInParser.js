const puppeteer = require("puppeteer");
const fs = require("fs/promises");

async function start() {
  // opens new instance of the browser
  // const browser = await puppeteer.launch();

  /**
   * Connects to the running web browser.
   * EndpointUrl changes everytime you relaunch the browser.
   * Go to http://127.0.0.1:9222/json/version to find current endpoint.
   */
  const wsChromeEndpointUrl =
    "ws://127.0.0.1:9222/devtools/browser/dad875a5-b69f-40fd-9340-a6e70ecc206e";
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
  });

  const websiteUrl = "https://www.linkedin.com/feed/";

  const page = await browser.newPage();

  // paste needed list
  const focusArray = [
    "Matthias Laug Tier Mobility",
    "Rahul Vohra Superhuman",
    "Nnamdi Emelifeonwu Definely",
  ];

  await page.goto(websiteUrl);

  async function writeInCSVFile(content) {
    try {
      await fs.appendFile(
        "C:\\Users\\BohdanF\\Desktop\\leadLinkedIn1.csv",
        content
      );
    } catch (err) {
      console.log(err);
    }
  }

  for (const element of focusArray) {
    await page.click("#global-nav-search > div > button");
    await page.waitForTimeout(500);

    await page.type("#global-nav-typeahead > input", element);
    await page.waitForTimeout(750);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);

    const leadProfileSelector = "#main > div > div > div.pv2.ph0.mb2.artdeco-card > div > a > div > div.search-nec__hero-kcard-v2-content.t-black--light > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)";

    if (await page.$(leadProfileSelector) !== null) {
      await page.click(leadProfileSelector);
    } else await getLeadNameBySelector(null);

    async function getLeadNameBySelector(selector) {
      await page.waitForTimeout(1000);
      if ((await page.$(selector)) !== null) {
        return await page.$eval(selector, (element) => element.innerText);
      } else return "-";
    }

    async function getLeadLinkedInUrl() {
      await page.waitForTimeout(500);
      if (await page.evaluate(() => document.location.href) !== null) {
        return await page.evaluate(() => document.location.href);
      } else return "-";
    }

    const leadName = await getLeadNameBySelector(".text-heading-xlarge");
    console.log("Lead name: " + leadName);

    const leadLinkedInUrl = await getLeadLinkedInUrl();
    console.log("Lead's LinkedIn url: " + leadLinkedInUrl);

    let data;

    if (leadLinkedInUrl.includes("keywords")) {
      data = leadName + ";" + "-" + "\n";
    } else data = leadName + ";" + leadLinkedInUrl + "\n";

    await writeInCSVFile(data);

    await page.goto(websiteUrl);

    await page.waitForTimeout(300)
  }

  //await browser.close();
}

start();
