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
    "ws://127.0.0.1:9222/devtools/browser/771dfae4-83cf-4864-ad7e-c9bc3cba0e07";
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
  });
  const websiteUrl = "https://app.dealroom.co/dashboard";

  const page = await browser.newPage();

  const companiesArray = ["BlockFi", "Polkadot"];

  await page.goto(websiteUrl);

  // async function writeInFile(content) {
  //   try {
  //     await fs.appendFile("C:\\Users\\BohdanF\\Desktop\\test.txt", content)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async function writeInCSVFile(content) {
    try {
      await fs.appendFile("C:\\Users\\BohdanF\\Desktop\\test.csv", content);
    } catch (err) {
      console.log(err);
    }
  }

  for (const element of companiesArray) {
    await page.waitForTimeout(2000);
    await page.type(
      "#app > div > div.top-fixed-content > header > div:nth-child(3) > div > div > div > div > input",
      element
    );
    await page.waitForTimeout(3000);

    await page.click("#react-autowhatever-1--item-0");
    await page.waitForTimeout(1500);

    async function getInfoBySelector(selector) {
      //await page.waitForSelector(selector);
      await page.waitForTimeout(2500);
      if ((await page.$(selector)) !== null) {
        return await page.$eval(selector, (element) => element.innerText);
      } else return "-";
    }

    async function getJobsInfoBySelector(pageSelector, listSelector) {
      await page.waitForTimeout(2500);
      await page.click(pageSelector);

      await page.waitForSelector(listSelector);
      await page.waitForTimeout(1000);

      return await page.$$eval(listSelector, (els) =>
        els.map((e) => ({
          jobTitle: JSON.stringify(e.innerText.toString())
            .split("\\")[0]
            .substring(1),
          basedIn: JSON.stringify(e.innerText.toString())
            .split("\\")[1]
            .substring(9),
          postedOn: JSON.stringify(e.innerText.toString())
            .split("\\")[2]
            .substring(10)
            .slice(0, -1),
          link: e.innerHTML
            .match(/(https?:\/\/[^\s]+)/g)[0]
            .slice(0, -1)
            .replace("&amp;", "&"),
        }))
      );
    }

    function getIsCompanyHiring(jobs) {
      let jobsAmount = jobs.replace(/[^0-9]+/g, "");

      return parseInt(jobsAmount) > 0;
    }

    const companyName = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-name > h1"
    );
    console.log("Company name: " + companyName);

    const companyValuation = await getInfoBySelector(".valuation__value");
    const writeCompanyValuation =
      companyValuation === "-"
        ? companyValuation
        : companyValuation.substring(1).concat(", $");
    console.log("Company Valuation: " + writeCompanyValuation);

    const companyTotalFunding = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section:nth-child(3) > div.card__content.card__content--with-padding > table > tfoot > tr"
    );
    const writeCompanyTotalFunding =
      companyTotalFunding.replace("Total Funding", "").trim() === "-"
        ? "-"
        : companyTotalFunding
            .replace("Total Funding", "")
            .trim()
            .substring(1)
            .concat(", $");
    console.log("Company funding: " + writeCompanyTotalFunding);

    const isCompanyHiring = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7) > span"
    );
    const writeIsCompanyHiring = getIsCompanyHiring(isCompanyHiring);
    console.log("Is company hiring?: " + writeIsCompanyHiring);

    const companyWebsite = await getInfoBySelector(".item-details-info__url");
    console.log("Company website: " + companyWebsite);

    const companyLinkedIn = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.entity-details > div.details > div.item-details-info__website > div > a:nth-child(3) > span.accessible-hide"
    );
    console.log("Company LinkedIn: " + companyLinkedIn);

    const companyNumberOfEmployees = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section.box.card.company-info > div.card__content.card__content--with-padding > div > div.field.employees > div.description > span > a"
    );
    console.log("Company number of employees: " + companyNumberOfEmployees);

    let companyJobs;
    let writeCompanyJobs;
    if (getIsCompanyHiring(isCompanyHiring)) {
      companyJobs = await getJobsInfoBySelector(
        "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7)",
        ".company-card__slot1"
      );
      writeCompanyJobs = JSON.stringify(companyJobs);
      console.log("Company jobs: " + writeCompanyJobs);
    } else {
      writeCompanyJobs = "-";
      console.log("Company jobs: " + writeCompanyJobs);
    }

    let data =
      companyName +
      ";" +
      writeCompanyValuation +
      ";" +
      writeCompanyTotalFunding +
      ";" +
      writeIsCompanyHiring +
      ";" +
      companyWebsite +
      ";" +
      writeCompanyJobs +
      ";" +
      companyLinkedIn +
      ";" +
      companyNumberOfEmployees +
      "\n";

    await writeInCSVFile(data);

    await page.goto(websiteUrl);
  }

  //await browser.close();
}

start();
