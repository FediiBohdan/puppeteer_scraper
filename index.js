const puppeteer = require("puppeteer");
//fs = require('fs');
const fs = require('fs/promises');
// const Excel = require("exceljs");

async function start() {
  // opens new instance of the browser
  // const browser = await puppeteer.launch();

  /**
   * Connects to the running web browser.
   * EndpointUrl changes everytime you relaunch the browser.
   * Go to http://127.0.0.1:9222/json/version to find current endpoint.
   */
  const wsChromeEndpointUrl =
    "ws://127.0.0.1:9222/devtools/browser/ad7122b9-c830-4434-bfa9-94903db02651";
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
  });
  const websiteUrl = "https://app.dealroom.co/dashboard";

  // creates new tab
  const page = await browser.newPage();

  //const companiesArray = ["Blockchain", "Polkadot", "BlockFi", "Cardano", "Tezos.com", "Binance.US", "FalconX", "Ripple", "EdgeandNode.com", "Current"];
  const companiesArray = ["BlockFi"];
  await page.goto(websiteUrl);

  async function writeInFile(content) {
    try {
      await fs.appendFile("C:\\Users\\BohdanF\\Desktop\\test.txt", content)
    } catch (err) {
      console.log(err);
    }
  }

  const startToday = new Date();
  const startDate =
      startToday.getFullYear() +
      "-" +
      (startToday.getMonth() + 1) +
      "-" +
      startToday.getDate();
  const startTime =
      startToday.getHours() + ":" + startToday.getMinutes() + ":" + startToday.getSeconds();
  const startDateTime = startDate + " " + startTime;
  await writeInFile("Start date and time: " + startDateTime + "\n\n");

  for (const element of companiesArray) {
    await page.waitForTimeout(2000);

    await page.type(
      "#app > div > div.top-fixed-content > header > div:nth-child(3) > div > div > div > div > input",
      element
    );

    await page.waitForTimeout(2500);

    await page.click("#react-autowhatever-1--item-0");

    await page.waitForTimeout(1000);

    async function getInfoBySelector(selector) {
      //await page.waitForSelector(selector);
      await page.waitForTimeout(3000);
      if ((await page.$(selector)) !== null) {
        return await page.$eval(selector, (element) => element.innerText);
      } else return "-";
    }

    async function getJobsInfoBySelector(pageSelector, listSelector) {
      await page.waitForTimeout(3000);
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
          link: e.innerHTML.match(/(https?:\/\/[^\s]+)/g)[0].slice(0, -1),
        }))
      );
    }

    function getIsCompanyHiring(jobs) {
      let jobsAmount = jobs.replace(/[^0-9]+/g, "");

      return parseInt(jobsAmount) > 0;
    }

    // async function writeInFile(index, value) {
    //   // Reading our test file
    //   let file = 'C:\\Users\\BohdanF\\Desktop\\test.xlsx';
    //
    //   var workbook = new Excel.Workbook();
    //   workbook.xlsx.readFile(file)
    //       .then(function()  {
    //         var worksheet = workbook.getWorksheet(1);
    //         var lastRow = worksheet.lastRow;
    //         // var getRowInsert = worksheet.getRow(++(lastRow.number));
    //         var getRowInsert = worksheet.getRow(4);
    //         getRowInsert.getCell(index).value = value;
    //         getRowInsert.commit();
    //         return workbook.xlsx.writeFile(file);
    //       });
    // //await writeInFile("G", companyValuation);
    //
    // }

    const companyName = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-name > h1"
    );
    console.log("Company name: " + companyName);
    await writeInFile("Company name: " + companyName + "\n")

    const companyValuation = await getInfoBySelector(".valuation__value");
    console.log("Company Valuation: " + companyValuation);
    await writeInFile("Company valuation: " + companyValuation + "\n")

    const companyTotalFunding = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section:nth-child(3) > div.card__content.card__content--with-padding > table > tfoot > tr"
    );
    console.log(
      "Company funding: " +
        companyTotalFunding.replace("Total Funding", "").trim()
    );
    await writeInFile("Company total funding: " +
        companyTotalFunding.replace("Total Funding", "").trim() + "\n")

    const isCompanyHiring = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7) > span"
    );
    console.log("Is company hiring?: " + getIsCompanyHiring(isCompanyHiring));
    await writeInFile("Is company hiring?: " + getIsCompanyHiring(isCompanyHiring) + "\n")

    const companyWebsite = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.item-details-info__website > a"
    );
    console.log("Company website: " + companyWebsite);
    await writeInFile("Company website: " + companyWebsite + "\n")

    const companyLinkedIn = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.item-details-info__website > div > a:nth-child(3) > span.accessible-hide"
    );
    console.log("Company LinkedIn: " + companyLinkedIn);
    await writeInFile("Company LinkedIn: " + companyLinkedIn + "\n")

    const companyNumberOfEmployees = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section.box.card.company-info > div.card__content.card__content--with-padding > div > div.field.employees > div.description > span > a"
    );
    console.log("Company number of employees: " + companyNumberOfEmployees);
    await writeInFile("Company number of employees: " + companyNumberOfEmployees + "\n")

    if (getIsCompanyHiring(isCompanyHiring)) {
      const companyJobs = await getJobsInfoBySelector(
        "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7)",
        ".company-card__slot1"
      );
      console.log("Company jobs: " + JSON.stringify(companyJobs));
      await writeInFile("Company jobs: " + JSON.stringify(companyJobs) + "\n")
    } else {
      console.log("Company jobs: -");
      await writeInFile("Company jobs: - " + "\n")
    }

    await writeInFile("---------------------" + "\n\n")

    await page.waitForTimeout(1000);
    await page.goto(websiteUrl);
    await page.waitForTimeout(1000);
  }

  const endToday = new Date();
  const endDate =
      endToday.getFullYear() +
      "-" +
      (endToday.getMonth() + 1) +
      "-" +
      endToday.getDate();
  const endTime =
      endToday.getHours() + ":" + endToday.getMinutes() + ":" + endToday.getSeconds();
  const endDateTime = endDate + " " + endTime;
  await writeInFile("End date and time: " + endDateTime + "\n\n");
  //await browser.close();
}

start();
